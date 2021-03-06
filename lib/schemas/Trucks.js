Schemas.Truck = new SimpleSchema({
    model: {
        // Labels are used to reffer to this field in validation
        label: 'Truck Model (tractor, tipper truck..) ',
        // Specifying the allowed type
        type: String
    },
    license: {
        label: 'Truck License Number',
        type: String
    },
    registerDate: {
        label: 'Truck Registered Date (to the Council)',
        type: Date,
        autoform: {
            type: "pickadate"
        }
    },
    onDuty: {
        type: Boolean,
        optional: true,
        autoform: {
            type: 'hidden'
        }
    },
    lat: {
        type: String,
        optional: true,
        autoform: {
            type: 'hidden'
        }
    },
    lng: {
        type: String,
        optional: true,
        autoform: {
            type: 'hidden'
        }
    },
    busyHours: {
        type: String,
        optional: true,
        autoform: {
            type: 'hidden'
        }
    }
});
