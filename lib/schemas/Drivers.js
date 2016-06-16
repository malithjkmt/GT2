Schemas.Driver = new SimpleSchema({
    name: {
        // Labels are used to reffer to this field in validation
        label: 'Name',
        // Specifying the allowed type
        type: String
    },
    nic: {
        label: 'NIC Number',
        type: String
    },
    employee: {
        label: 'Employee Number',
        type: String
    },
    drivingLicense: {
        label: 'Driving License Number',
        type: String
    },
    phone: {
        label: 'Mobile Phone Number',
        type: String
    },
    busyHours: {
        type: String,
        optional: true,
        autoform: {
            type: 'hidden'
        }
    }
});
