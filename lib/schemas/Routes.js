Schemas.Route = new SimpleSchema({
    startTime: {
        // Labels are used to reffer to this field in validation
        label: 'Start Time',
        // Specifying the allowed type
        type: String
    },
    biodegradable: {
        // Labels are used to reffer to this field in validation
        label: 'Biodegradable Wastes (දිරන)',
        // Specifying the allowed type
        type: Boolean
    },
    nonBiodegradable: {
        // Labels are used to reffer to this field in validation
        label: 'Non-biodegradable Wastes (නොදිරන)',
        // Specifying the allowed type
        type: Boolean
    },
    driverNIC: {
        // Labels are used to reffer to this field in validation
        label: 'Driver',
        // Specifying the allowed type
        type: String

    },
    TruckNO: {
        // Labels are used to reffer to this field in validation
        label: 'Truck',
        // Specifying the allowed type
        type: String

    },
    mapRoute: {
        type: String,
        autoform: {
            type: 'hidden'
        }

    },
    active: {
        type: Boolean,
        optional: true,
        autoform: {
            type: 'hidden'
        }
    },
    day: {
        label: 'Day',
        optional: true,
        type: String
    }
});
