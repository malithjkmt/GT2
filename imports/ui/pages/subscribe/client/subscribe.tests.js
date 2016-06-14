/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

import { chai } from 'meteor/practicalmeteor:chai';
import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';

import { withRenderedTemplate } from '../../../test-helpers.js';
import '../subscribe.js';

describe('subscribe component', function () {
    it('renders correctly with simple data 1', function () {

        withRenderedTemplate('subscribe', "", el => {
            chai.assert.equal($(el).find('.map-canvas').length, 2);
        });
    });

    it('renders correctly with simple data 2', function () {

        withRenderedTemplate('subscribe', "", el => {
            chai.assert.equal($(el).find('.map-container').length, 2);
        });

    });

});