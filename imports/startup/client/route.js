
// Import to load these templates


import '../../ui/pages/map/map.js';
import '../../ui/pages/driver/driver.js';
import '../../ui/pages/townsman/registerTownsman.js';
import '../../ui/pages/truck/truck.js';
import '../../ui/pages/home/home.js';
import '../../ui/pages/feedback/feedback.js';
import '../../ui/pages/feedback/viewFeedback.js';
import '../../ui/pages/feedback/feedbackThreads.js';

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


Router.route('/feedback/:townsmanID', function () {
    var adminID = 'HxGqztWygWCxco4d5';    // admin ID should be accuired from DB ??? only one admin or multiple???????
    this.redirect('/feedback/' + this.params.townsmanID+ '/' + adminID);
});

Router.route('/feedback/:townsmanID/:adminID', function () {
    this.layout('myLayout');
    this.render('feedback', {
        data: function () {

            Session.set('adminID', this.params.adminID);
            Session.set('townsmanID',this.params.townsmanID);
            console.log(Session.get('townsmanID'));
            
            return Feedbacks.find({townsmanID: this.params.townsmanID} );  // query feedbacks only relevent to 'user'
        }
    });
    this.render('nav', {to: 'nav'});

});


Router.route('/feedbackThreads', function () {
    this.layout('myLayout');
    this.render('feedbackThreads');
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
