Schemas.Townsman = new SimpleSchema({
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

    phone: {
        label: 'Mobile Phone Number',
        type: String
    },
    location:{
        label:' ',
        type: String,
        autoform: {
            type: 'map',
            afFieldInput: {
                geolocation : true,
                searchBox: true,
                autolocate: true,
                height: '300px',
                autolocate: true,
                googleMap:{
                    backgroundColor: 'white',
                }

            }
        }
    }
});
