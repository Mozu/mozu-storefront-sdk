module.exports = {
    DEFAULT_WISHLIST_NAME: 'my_wishlist',
    PAYMENT_STATUSES: {
        NEW: "New"
    },
    PAYMENT_ACTIONS: {
        VOID: "VoidPayment"
    },
    ORDER_STATUSES: {
        ABANDONED: "Abandoned",
        ACCEPTED: "Accepted",
        CANCELLED: "Cancelled",
        COMPLETED: "Completed",
        CREATED: "Created",
        PENDING_REVIEW: "PendingReview",
        PROCESSING: "Processing",
        ERRORED: "Errored",
        SUBMITTED: "Submitted",
        VALIDATED: "Validated"
    },
    ORDER_ACTIONS: {
        CREATE_ORDER: "CreateOrder",
        SUBMIT_ORDER: "SubmitOrder",
        ACCEPT_ORDER: "AcceptOrder",
        VALIDATE_ORDER: "ValidateOrder",
        SET_ORDER_AS_PROCESSING: "SetOrderAsProcessing",
        COMPLETE_ORDER: "CompleteOrder",
        CANCEL_ORDER: "CancelOrder",
        REOPEN_ORDER: "ReopenOrder"
    },
    COMMERCE_FULFILLMENT_METHODS: {
        SHIP: "Ship",
        PICKUP: "Pickup",
        DIGITAL: "Digital"
    },
    CATALOG_FULFILLMENT_TYPES: {
        SHIP: "DirectShip",
        PICKUP: "InStorePickup",
        DIGITAL: "Digital"
    },
    GOODS_TYPES: {
        PHYSICAL: 'Physical',
        DIGITAL: 'Digital'
    }
};
