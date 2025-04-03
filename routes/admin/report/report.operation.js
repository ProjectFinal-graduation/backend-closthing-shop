const Order = require("../../../models/order");
const util = require("../../../exports/util");
const serviceUtils = require('../../../exports/serviceUtils');
const ERROR_CODES = require('../../../errorcodes/index.code');
const errorUtils = require('../../../exports/errorUtils');

const getReport = async (req, res) => {
    try {
        const [reportData, bestClothSeller, bestSellersByCategory, salesByMonth, totalRevenue] = await Promise.all([
            // Aggregate counts
            Order.aggregate([
                {
                    $facet: {
                        totalOrders: [{ $count: "count" }],
                        totalPending: [{ $match: { "status.order": "Pending" } }, { $count: "count" }],
                        totalProcessing: [{ $match: { "status.order": "Processing" } }, { $count: "count" }],
                        totalDelivering: [{ $match: { "status.order": "Delivering" } }, { $count: "count" }],
                        totalCompleted: [{ $match: { "status.order": "Completed" } }, { $count: "count" }],
                        totalCancelled: [{ $match: { "status.order": "Cancelled" } }, { $count: "count" }]
                    }
                },
                {
                    $project: {
                        totalOrders: { $arrayElemAt: ["$totalOrders.count", 0] },
                        totalPending: { $arrayElemAt: ["$totalPending.count", 0] },
                        totalProcessing: { $arrayElemAt: ["$totalProcessing.count", 0] },
                        totalDelivering: { $arrayElemAt: ["$totalDelivering.count", 0] },
                        totalCompleted: { $arrayElemAt: ["$totalCompleted.count", 0] },
                        totalCancelled: { $arrayElemAt: ["$totalCancelled.count", 0] }
                    }
                }
            ]),

            // Best cloth sellers
            Order.aggregate([
                { $unwind: "$clothAndQuantities" },
                { $group: { _id: "$clothAndQuantities.cloth", total: { $sum: "$clothAndQuantities.quantity" } } },
                { $sort: { total: -1 } },
                { $limit: 3 },
                {
                    $lookup: {
                        from: "clothes",
                        localField: "_id",
                        foreignField: "_id",
                        as: "cloth"
                    }
                },
                { $unwind: "$cloth" },
                {
                    $project: {
                        _id: 0,
                        cloth: "$cloth.name",
                        id: "$cloth.id",
                        total: 1
                    }
                },
                {
                    $sort: {
                        total: -1
                    }
                },
                {
                    $limit: 3
                }
            ]),

            // Best sellers by category
            Order.aggregate([
                { $unwind: "$clothAndQuantities" },
                {
                    $lookup: {
                        from: "clothes",
                        localField: "clothAndQuantities.cloth",
                        foreignField: "_id",
                        as: "clothDetails"
                    }
                },
                { $unwind: "$clothDetails" },
                { $group: { _id: "$clothDetails.category", totalQuantitySold: { $sum: "$clothAndQuantities.quantity" } } },
                { $sort: { totalQuantitySold: -1 } },
                {
                    $lookup: {
                        from: "categories",
                        localField: "_id",
                        foreignField: "_id",
                        as: "categoryDetails"
                    }
                },
                { $unwind: "$categoryDetails" },
                {
                    $project: {
                        _id: 0,
                        category: {
                            id: "$_id",
                            name: "$categoryDetails.name"
                        },
                        totalQuantitySold: 1
                    }
                },
                {
                    $sort: {
                        total: -1
                    }
                },
                {
                    $limit: 3
                }
            ]),

            // Sales by month
            Order.aggregate([
                {
                    $group: {
                        _id: {
                            year: { $year: "$createdAt" },
                            month: { $month: "$createdAt" }
                        },
                        totalRevenue: { $sum: "$totalPrice" }
                    }
                },
                { $match: { "_id.year": new Date().getFullYear() } },
                { $sort: { "_id.month": 1 } },
                {
                    $group: {
                        _id: null,
                        salesByMonth: {
                            $push: {
                                month: "$_id.month",
                                totalRevenue: "$totalRevenue"
                            }
                        }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        salesByMonth: {
                            $map: {
                                input: { $range: [1, 13] },
                                as: "month",
                                in: {
                                    $let: {
                                        vars: {
                                            foundMonth: {
                                                $arrayElemAt: [
                                                    {
                                                        $filter: {
                                                            input: "$salesByMonth",
                                                            as: "sale",
                                                            cond: { $eq: ["$$sale.month", "$$month"] }
                                                        }
                                                    },
                                                    0
                                                ]
                                            }
                                        },
                                        in: { $ifNull: ["$$foundMonth.totalRevenue", 0] }
                                    }
                                }
                            }
                        }
                    }
                }
            ]),

            // Total revenue
            Order.aggregate([
                {
                    $group: {
                        _id: null,
                        totalRevenue: { $sum: "$totalPrice" }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        totalRevenue: 1
                    }
                }
            ])
        ]);

        const report = {
            count: reportData.length > 0 ? reportData[0] : {},
            bestClothSeller,
            bestSellersByCategory,
            totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].totalRevenue : 0,
            salesByMonth: salesByMonth.length > 0 ? salesByMonth[0].salesByMonth : []
        };

        util.ReponseSuss(req, res, report);
    } catch (error) {
        util.ResFail(req, res, errorUtils.ErrorHelper(error));
    }
};

module.exports = {
    getReport
};
