// Import to load these templates

import '../../ui/pages/nav.js';

import '../../ui/pages/map/map.js';
import '../../ui/pages/driver/driver.js';
import '../../ui/pages/townsman/setupMyLocation.js';
import '../../ui/pages/truck/truck.js';
import '../../ui/pages/home/home.js';
import '../../ui/pages/feedback/feedback.js';
import '../../ui/pages/feedback/viewFeedback.js';
import '../../ui/pages/feedback/feedbackThreads.js';
import '../../ui/pages/admin/createAdmin.js';
import '../../ui/pages/testingConsole/dummyTruck.js';
import '../../ui/pages/addRoute/addRoute.js';
import '../../ui/pages/subscribe/subscribe.js';
import '../../ui/pages/setupNotifications/setupNotifications.js';

import '../../ui/pages/footer.html';
import '../../ui/pages/master_layout.html';

import '../../ui/pages/nav.js';
import '../../ui/pages/page_not_found.html';

import '../../ui/layouts/myLayout.js';

Meteor.subscribe('trucks', 'routes', 'feedbacks');


Router.configure({
    layoutTemplate: 'master_layout',
    notFoundTemplate: 'pageNotFound',
    yieldTemplates: {
        nav: {to: 'nav'},
        footer: {to: 'footer'},
    }
});


Router.route('/map/:_id', function () {
    this.layout('myLayout', {
        data: function () {
            return "GT2 Live";
        }
    });
    this.render('mapView', {
        data: {
            route_id: this.params._id
        }
    });
    this.render('nav', {to: 'nav'});
});




Router.route('/', function () {
    this.layout('myLayout', {
        data: function () {
            return "GT2";
        }
    });
    this.render('home');
    this.render('nav', {to: 'nav'});
});

Router.route('/feedback/:townsmanID', function () {

    // admin ID should be acquired from DB ??? only one admin or multiple???????
    Meteor.call("findAdminID", function (error, result) {
        if (error) {
            console.log(error.reason);
            return;
        }
        Session.set('adminID', result);
        console.log("Admin found from DB " + result);
    });

    this.redirect('/feedback/' + this.params.townsmanID + '/' + Session.get('adminID'));


});

Router.route('/feedback/:townsmanID/:adminID', function () {
    this.layout('myLayout', {
        data: function () {
            return "Feedback";
        }
    });
    this.render('feedback', {
        data: function () {

            Session.set('adminID', this.params.adminID);
            Session.set('townsmanID', this.params.townsmanID);
            console.log(Session.get('townsmanID'));

            return Feedbacks.find({townsmanID: this.params.townsmanID});  // query feedbacks only relevent to 'user'
        }
    });
    this.render('nav', {to: 'nav'});

});


Router.route('/feedbackThreads', function () {
    this.layout('myLayout', {
        data: function () {
            return "Feedbacks";
        }
    });
    this.render('feedbackThreads');
    this.render('nav', {to: 'nav'});

});


Router.route('/createAdmin', function () {
    this.layout('myLayout', {
        data: function () {
            return "Create Admin";
        }
    });
    this.render('createAdmin', {
        data: function () {
            return "Create Admin";
        }
    });
    this.render('nav', {to: 'nav'});
});

Router.route('/viewDrivers', function () {
    this.layout('myLayout', {
        data: function () {
            return "Drivers";
        }
    });
    this.render('viewDrivers');
    this.render('nav', {to: 'nav'});
});

Router.route('/registerDriver', function () {
    this.layout('myLayout', {
        data: function () {
            return "Register Driver";
        }
    });
    this.render('registerDriver');
    this.render('nav', {to: 'nav'});
});

Router.route('/updateDriver/:_id', function () {
    this.layout('myLayout', {
        data: function () {
            return "Update Driver";
        }
    });
    this.render('updateDriver', {
        data: function () {
            return Drivers.findOne({_id: this.params._id});
        }
    });
    this.render('nav', {to: 'nav'});
});


Router.route('/setupMyLocation', function () {
    this.layout('myLayout', {
        data: function () {
            return "My Location";
        }
    });
    this.render('setupMyLocation');
    this.render('nav', {to: 'nav'});
});

Router.route('/viewTrucks', function () {
    this.layout('myLayout', {
        data: function () {
            return "Trucks";
        }
    });
    this.render('viewTrucks');
    this.render('nav', {to: 'nav'});
});


Router.route('/registerTruck', function () {
    this.layout('myLayout', {
        data: function () {
            return "Register Truck";
        }
    });
    this.render('registerTruck');
    this.render('nav', {to: 'nav'});
});

Router.route('/updateTruck/:_id', function () {
    this.layout('myLayout', {
        data: function () {
            return "Update Truck";
        }
    });
    this.render('updateTruck', {
        data: function () {
            return Trucks.findOne({_id: this.params._id});
        }
    });
    this.render('nav', {to: 'nav'});
});


Router.route('/home', function () {
    this.layout('myLayout', {
        data: function () {
            return "GT2 Home";
        }
    });
    this.render('home');
    this.render('nav', {to: 'nav'});
});

Router.route('/dummyConsole', function () {
    this.layout('myLayout', {
        data: function () {
            return "Dummy Console";
        }
    });
    this.render('dummyMapView');
    this.render('nav', {to: 'nav'});
});


Router.route('/subscribe', function () {
    this.layout('myLayout', {
        data: function () {
            return "Subscribe";
        }
    });
    this.render('subscribe');
    this.render('nav', {to: 'nav'});

});

Router.route('/setupNotifications/:route_id/:user_id', function () {
    this.layout('myLayout', {
        data: function () {
            return "Setup Notifications";
        }
    });
    this.render('setupNotifications', {
        data: {
            route_id: this.params.route_id,
            user_id: this.params.user_id
        }
    });
    this.render('nav', {to: 'nav'});

});

Router.route('/addRoute', function () {
    this.layout('myLayout', {
        data: function () {
            return "Add Route";
        }
    });
    this.render('addRoute');
    this.render('nav', {to: 'nav'});
});

Router.route('/addRouteDateTime', function () {
    this.layout('myLayout', {
        data: function () {
            return "Add Route";
        }
    });
    this.render('addRouteDateTime');
    this.render('nav', {to: 'nav'});
});

Router.route('/addRouteTruckDriver', function () {
    this.layout('myLayout', {
        data: function () {
            return "Add Route";
        }
    });
    this.render('addRouteTruckDriver');
    this.render('nav', {to: 'nav'});
});




//Routes

AccountsTemplates.configureRoute('signIn');
AccountsTemplates.configureRoute('signUp');

