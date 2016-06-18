/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

import { chai } from 'meteor/practicalmeteor:chai';
import { $ } from 'meteor/jquery';

import { withRenderedTemplate } from '../../../test-helpers.js';
import '../subscribe.js';
var count = 1;

describe('subscribe component', function () {
    it('renders correctly with simple data 1', function () {

        withRenderedTemplate('subscribe', "", el => {
            chai.assert.equal($(el).find('.map-container').length, count);
        });
    });

    it('renders correctly with simple data 2', function () {

        withRenderedTemplate('subscribe', "", el => {
            chai.assert.equal($(el).find('.map-container').length, count);
        });

    });
    it('renders correctly with simple data 3', function () {

        withRenderedTemplate('subscribe', "", el => {
            chai.assert.equal($(el).find('.map-container').length, count);
        });

    });it('renders correctly with simple data 4', function () {

        withRenderedTemplate('subscribe', "", el => {
            chai.assert.equal($(el).find('.map-container').length, count);
        });

    });it('renders correctly with simple data 5', function () {

        withRenderedTemplate('subscribe', "", el => {
            chai.assert.equal($(el).find('.map-container').length, count);
        });

    });
    it('renders correctly with simple data 6', function () {

        withRenderedTemplate('subscribe', "", el => {
            chai.assert.equal($(el).find('.map-container').length, count);
        });

    });
    it('renders correctly with simple data 7', function () {

        withRenderedTemplate('subscribe', "", el => {
            chai.assert.equal($(el).find('.map-container').length, count);
        });

    });



});