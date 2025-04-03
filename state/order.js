let PaymentStatus = {
    states: {
        "Not Paid": [],
        "Paid": [],
        "Refunded": [],
    },
    default: "Not Paid"
}

let OrderStatus = {
    states: {
        "Pending": [],
        "Processing": [],
        "Delivering": [],
        "Completed": [],
        "Cancelled": []
    },
    default: "Pending"
}

let DeliveryStatus = {
    states: {
        "Pending": [],
        "Processing": [],
        "Delivered": []
    },
    default: "Pending"
}
let PaymentMethod = {
    states: {
        "Cash": [],
        "Bank": []
    },
    default: "Cash"
}

module.exports = { PaymentStatus, DeliveryStatus, OrderStatus, PaymentMethod }
