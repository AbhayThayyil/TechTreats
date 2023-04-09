var db = require("../config/connection");
var collection = require("../config/collection");
var objectId = require("mongodb").ObjectId;

module.exports = {
  //to get the total sales
  getTotalSales: () => {
    return new Promise(async (resolve, reject) => {
      let totalSales = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .count();
      resolve(totalSales);
    });
  },

  //to get total revenue
  getTotalRevenue: () => {
    return new Promise(async (resolve, reject) => {
      let totalRevenue = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $group: {
              _id: null,
              totalAmount: { $sum: "$totalPrice" },
            },
          },
        ])
        .toArray();
      console.log(totalRevenue, "Total reveneue from aggregation");
      resolve(totalRevenue[0].totalAmount);
    });
  },

  //to get total number of customers(users)
  getTotalUsers: () => {
    return new Promise(async (resolve, reject) => {
      let customers = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .count();
      console.log(customers, "Total number of customers");
      resolve(customers);
    });
  },

  //to get sales report
  getSalesReport: () => {
    return new Promise(async (resolve, reject) => {
      let salesReport = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          { $unwind: "$products" },
          {
            $group: {
              _id: "$products.item",
              totalQuantity: { $sum: "$products.quantity" },
            },
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTION,
              localField: "_id",
              foreignField: "_id",
              as: "productData",
            },
          },
          { $unwind: "$productData" },
          {
            $project: {
              productName: "$productData.name",
              orderQuantity: "$totalQuantity",
              productPrice: "$productData.price",
              totalRevenue: {
                $multiply: ["$totalQuantity", "$productData.price"],
              },
            },
          },
        ])
        .toArray();
      console.log(salesReport, "The sales report");
      let total = 0;
      salesReport.forEach((element) => {
        total = total + element.totalRevenue;
      });
      // console.log(total,"final total check");
      salesReport.finalGrossAmount = total;
      resolve(salesReport);
    });
  },

  //to get filtered sales report

  getFilteredReport: (fromDate, toDate) => {
    console.log(fromDate, toDate, "date checks for filtered report");

    return new Promise(async (resolve, reject) => {
      let filteredSalesReport = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          { $unwind: "$products" },
          {
            $match: {
              date: { $gte: new Date(fromDate), $lte: new Date(toDate) },
            },
          },
          {
            $group: {
              _id: "$products.item",
              totalQuantity: { $sum: "$products.quantity" },
            },
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTION,
              localField: "_id",
              foreignField: "_id",
              as: "productData",
            },
          },
          { $unwind: "$productData" },
          {
            $project: {
              productName: "$productData.name",
              orderQuantity: "$totalQuantity",
              price: "$productData.price",
              revenue: { $multiply: ["$totalQuantity", "$productData.price"] },
            },
          },
        ])
        .toArray();
        console.log(filteredSalesReport,"filtered sales");
      let total = 0;
      filteredSalesReport.forEach((element) => {
        total = total + element.revenue;
      });
      console.log(total,"final total check");
      filteredSalesReport.finalGrossAmount = total;
      console.log(filteredSalesReport,"sales report from a date to another date");

      resolve(filteredSalesReport);
    });
  },

  //to get 5 recent sales
  getRecentSales: () => {
    return new Promise(async (resolve, reject) => {
      let recentSales = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .find()
        .sort({ _id: -1 })
        .limit(5)
        .toArray();
      console.log(recentSales, "Recent 5 sales done");
      resolve(recentSales);
    });
  },

  //to get monthly sales graph data
  getMonthlyGraph: () => {
    return new Promise(async (resolve, reject) => {
      let monthlyGraph = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $group: {
              _id: {
                month: { $month: "$date" },
                year: { $year: "$date" },
                revenue: { $sum: "$totalPrice" },
              },
            },
          },
          {
            $project: {
              _id: 0,
              year: "$_id.year",
              month: "$_id.month",
              revenue: "$_id.revenue",
            },
          },
          { $sort: { year: -1, month: -1 } },
          { $limit: 12 },
        ])
        .toArray();
      console.log(monthlyGraph, "Monthly graph data ");

      // to convert a month number to month name using toLocaleString()
      monthlyGraph.forEach((element) => {
        function getMonthName(month) {
          const date = new Date();
          date.setMonth(month - 1);
          return date.toLocaleString("en-US", { month: "long" });
        }
        element.month = getMonthName(element.month);
        //end

        console.log(monthlyGraph, "monthly data after month name conversion");
        resolve(monthlyGraph);
      });
    });
  },

  // to get weekly sales graph data

  getWeeklyGraph: () => {
    return new Promise(async (resolve, reject) => {
      let weeklyGraph = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $group: {
              _id: {
                year: { $year: "$date" },
                month: { $month: "$date" },
                day: { $dayOfMonth: "$date" },
              },
              revenue: { $sum: "$totalPrice" },
            },
          },
          {
            $project: {
              _id: 0,
              date: "$_id.day",
              month: "$_id.month",
              year: "$_id.year",
              revenue: 1,
            },
          },
          { $sort: { year: -1, month: -1, date: -1 } },
          { $limit: 7 },
        ])
        .toArray();

      console.log(weeklyGraph, "weekly data");

      weeklyGraph.forEach((weeklyGraph) => {
        weeklyGraph.ddmmyy =
          weeklyGraph.date + "/" + weeklyGraph.month + "/" + weeklyGraph.year;
      });

      console.log(weeklyGraph, "final weekly graph data");
      resolve(weeklyGraph);
    });
  },

  //to get weekly quantity

  getWeeklyQuantity: () => {
    return new Promise(async (resolve, reject) => {
      let weeklyQuantity = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          { $unwind: "$products" },
          {
            $group: {
              _id: {
                year: { $year: "$date" },
                month: { $month: "$date" },
                day: { $dayOfMonth: "$date" },
              },
              quantity: { $sum: "$products.quantity" },
            },
          },
          {
            $project: {
              _id: 0,
              date: "$_id.day",
              month: "$_id.month",
              year: "$_id.year",
              quantity: 1,
            },
          },
          { sort: { year: -1, month: -1, date: -1 } },
          { $limit: 7 },
        ])
        .toArray();

      console.log(weeklyQuantity, "weekly quantity of product sales");
      resolve(weeklyQuantity);
    });
  },
};
