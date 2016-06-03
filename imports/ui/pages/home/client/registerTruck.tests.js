/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

import { Factory } from 'meteor/dburles:factory';
import { chai } from 'meteor/practicalmeteor:chai';

import faker from 'meteor/practicalmeteor:faker';
import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';



import { withRenderedTemplate } from '../../../test-helpers.js';
import '../home.js';

Trucks = new Mongo.Collection('trucks');
Authors = new Meteor.Collection('authors');

describe('home', function () {

    // Passing arrow functions to Mocha is discouraged.
    // Their lexical binding of the this value makes them unable to access the Mocha context,
    // and statements like this.timeout(1000); will not work inside an arrow function.

    //Mocha provides the hooks before(), after(), beforeEach(), and afterEach(),
    // which can be used to set up preconditions and clean up after your tests.
    beforeEach(function () {
        Template.registerHelper('_', key => key);
    });

    afterEach(function () {
        Template.deregisterHelper('_');
    });


    it('renders correctly with simple data', function () {
        // This code will be executed by the test driver when the app is started
        // in the correct mode




        Factory.define('author', Authors, {
            license: 'John Smith',
            birthday:()=>  new Date()
        });


        Factory.define('truck', Trucks, {
            truck: Factory.get('author'),
            license: "GM-3052"
        });

        const truck = Factory.tree('truck');

        console.log(truck);
        withRenderedTemplate('home', truck , function(el) {
            chai.assert.equal($(el).find('input[type=text]').val(), truck.truck.license);
        });


    });
});