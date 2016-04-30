
// Import to load these templates


import '../../ui/pages/map/map.js';
import '../../ui/pages/driver/driver.js';
import '../../ui/pages/townsman/registerTownsman.js';
import '../../ui/pages/truck/truck.js';
import '../../ui/pages/home/home.js';
import '../../ui/pages/feedback/feedback.js';
import '../../ui/pages/feedback/viewFeedback.js';

import '../../ui/pages/footer.html';
import '../../ui/pages/master_layout.html';

import '../../ui/pages/nav.js';
import '../../ui/pages/page_not_found.html';

import '../../ui/layouts/myLayout.js';


Router.configure({
    layoutTemplate: 'master_layout',
    notFoundTemplate: 'pageNotFound',
    yieldTemplates: {
        nav: {to: 'nav'},
        footer: {to: 'footer'},
    }
});



Router.route('/map', function () {
    this.layout('myLayout');
    this.render('mapView');
    this.render('nav', {to: 'nav'});

});


Router.route('/', function () {
    this.layout('myLayout');
    this.render('home');
    this.render('nav', {to: 'nav'});
});

Router.route('/feedback', function () {
    this.layout('myLayout');
    this.render('feedback');
    this.render('nav', {to: 'nav'});

});

Router.route('/viewFeedback', function () {
    this.layout('myLayout');
    this.render('viewFeedback');
    this.render('nav', {to: 'nav'});

});

Router.route('/viewDrivers', function () {
    this.layout('myLayout');
    this.render('viewDrivers');
    this.render('nav', {to: 'nav'});
});

Router.route('/registerDriver', function () {
    this.layout('myLayout');
    this.render('registerDriver');
    this.render('nav', {to: 'nav'});
});

Router.route('/updateDriver/:_id', function () {
    this.layout('myLayout');
    this.render('updateDriver', {
        data: function () {
            return Drivers.findOne({_id: this.params._id});
        }
    });
    this.render('nav', {to: 'nav'});
});


Router.route('/registerTownsman', function () {
    this.layout('myLayout');
    this.render('registerTownsman');
    this.render('nav', {to: 'nav'});
});

Router.route('/viewTrucks', function () {
    this.layout('myLayout');
    this.render('viewTrucks');
    this.render('nav', {to: 'nav'});
});


Router.route('/registerTruck', function () {
    this.layout('myLayout');
    this.render('registerTruck');
    this.render('nav', {to: 'nav'});
});

Router.route('/updateTruck/:_id', function () {
    this.layout('myLayout');
    this.render('updateTruck', {
        data: function () {
            return Trucks.findOne({_id: this.params._id});
        }
    });
    this.render('nav', {to: 'nav'});
});


Router.route('/home', function () {
    this.layout('myLayout');
    this.render('home');
    this.render('nav', {to: 'nav'});
});


//Routes

AccountsTemplates.configureRoute('signIn');
AccountsTemplates.configureRoute('signUp');
