import Component from '@ember/component';
import { A } from '@ember/array';
import move from 'ember-animated/motions/move';
import { fadeOut, fadeIn } from 'ember-animated/motions/opacity';
import { sort } from '@ember/object/computed';
import dedent from '../utils/dedent';
import { highlightCode } from 'ember-cli-addon-docs/utils/compile-markdown';
import { computed } from '@ember/object';

export default Component.extend({

  init() {
    this._super(...arguments);
    this.set('selectedCountries', A([1, 2, 5, 14, 20].map(index => this.countries[index])));
  },

  * transition({ keptSprites, insertedSprites, removedSprites }) {
    insertedSprites.forEach(sprite => {
      fadeIn(sprite);
    });
    removedSprites.forEach(sprite => {
      fadeOut(sprite);
    });
    keptSprites.forEach(sprite => {
      fadeIn(sprite);
      move(sprite);
    });
  },

  countries: Object.freeze([
    { name: 'Afghanistan', id: 'Afghanistan' },
    { name: 'Albania', id: 'Albania' },
    { name: 'Algeria', id: 'Algeria' },
    { name: 'Andorra', id: 'Andorra' },
    { name: 'Angola', id: 'Angola' },
    { name: 'Antigua & Deps', id: 'Antigua & Deps' },
    { name: 'Argentina', id: 'Argentina' },
    { name: 'Armenia', id: 'Armenia' },
    { name: 'Australia', id: 'Australia' },
    { name: 'Austria', id: 'Austria' },
    { name: 'Azerbaijan', id: 'Azerbaijan' },
    { name: 'Bahamas', id: 'Bahamas' },
    { name: 'Bahrain', id: 'Bahrain' },
    { name: 'Bangladesh', id: 'Bangladesh' },
    { name: 'Barbados', id: 'Barbados' },
    { name: 'Belarus', id: 'Belarus' },
    { name: 'Belgium', id: 'Belgium' },
    { name: 'Belize', id: 'Belize' },
    { name: 'Benin', id: 'Benin' },
    { name: 'Bhutan', id: 'Bhutan' },
    { name: 'Bolivia', id: 'Bolivia' },
    { name: 'Bosnia Herzegovina', id: 'Bosnia Herzegovina' },
    { name: 'Botswana', id: 'Botswana' },
    { name: 'Brazil', id: 'Brazil' },
    { name: 'Brunei', id: 'Brunei' },
    { name: 'Bulgaria', id: 'Bulgaria' },
    { name: 'Burkina', id: 'Burkina' },
    { name: 'Burundi', id: 'Burundi' },
    { name: 'Cambodia', id: 'Cambodia' },
    { name: 'Cameroon', id: 'Cameroon' },
    { name: 'Canada', id: 'Canada' },
    { name: 'Cape Verde', id: 'Cape Verde' },
    { name: 'Central African Rep', id: 'Central African Rep' },
    { name: 'Chad', id: 'Chad' },
    { name: 'Chile', id: 'Chile' },
    { name: 'China', id: 'China' },
    { name: 'Colombia', id: 'Colombia' },
    { name: 'Comoros', id: 'Comoros' },
    { name: 'Congo', id: 'Congo' },
    { name: 'Congo {Democratic Rep}', id: 'Congo {Democratic Rep}' },
    { name: 'Costa Rica', id: 'Costa Rica' },
    { name: 'Croatia', id: 'Croatia' },
    { name: 'Cuba', id: 'Cuba' },
    { name: 'Cyprus', id: 'Cyprus' },
    { name: 'Czech Republic', id: 'Czech Republic' },
    { name: 'Denmark', id: 'Denmark' },
    { name: 'Djibouti', id: 'Djibouti' },
    { name: 'Dominica', id: 'Dominica' },
    { name: 'Dominican Republic', id: 'Dominican Republic' },
    { name: 'East Timor', id: 'East Timor' },
    { name: 'Ecuador', id: 'Ecuador' },
    { name: 'Egypt', id: 'Egypt' },
    { name: 'El Salvador', id: 'El Salvador' },
    { name: 'Equatorial Guinea', id: 'Equatorial Guinea' },
    { name: 'Eritrea', id: 'Eritrea' },
    { name: 'Estonia', id: 'Estonia' },
    { name: 'Ethiopia', id: 'Ethiopia' },
    { name: 'Fiji', id: 'Fiji' },
    { name: 'Finland', id: 'Finland' },
    { name: 'France', id: 'France' },
    { name: 'Gabon', id: 'Gabon' },
    { name: 'Gambia', id: 'Gambia' },
    { name: 'Georgia', id: 'Georgia' },
    { name: 'Germany', id: 'Germany' },
    { name: 'Ghana', id: 'Ghana' },
    { name: 'Greece', id: 'Greece' },
    { name: 'Grenada', id: 'Grenada' },
    { name: 'Guatemala', id: 'Guatemala' },
    { name: 'Guinea', id: 'Guinea' },
    { name: 'Guinea-Bissau', id: 'Guinea-Bissau' },
    { name: 'Guyana', id: 'Guyana' },
    { name: 'Haiti', id: 'Haiti' },
    { name: 'Honduras', id: 'Honduras' },
    { name: 'Hungary', id: 'Hungary' },
    { name: 'Iceland', id: 'Iceland' },
    { name: 'India', id: 'India' },
    { name: 'Indonesia', id: 'Indonesia' },
    { name: 'Iran', id: 'Iran' },
    { name: 'Iraq', id: 'Iraq' },
    { name: 'Ireland {Republic}', id: 'Ireland {Republic}' },
    { name: 'Israel', id: 'Israel' },
    { name: 'Italy', id: 'Italy' },
    { name: 'Ivory Coast', id: 'Ivory Coast' },
    { name: 'Jamaica', id: 'Jamaica' },
    { name: 'Japan', id: 'Japan' },
    { name: 'Jordan', id: 'Jordan' },
    { name: 'Kazakhstan', id: 'Kazakhstan' },
    { name: 'Kenya', id: 'Kenya' },
    { name: 'Kiribati', id: 'Kiribati' },
    { name: 'Korea North', id: 'Korea North' },
    { name: 'Korea South', id: 'Korea South' },
    { name: 'Kosovo', id: 'Kosovo' },
    { name: 'Kuwait', id: 'Kuwait' },
    { name: 'Kyrgyzstan', id: 'Kyrgyzstan' },
    { name: 'Laos', id: 'Laos' },
    { name: 'Latvia', id: 'Latvia' },
    { name: 'Lebanon', id: 'Lebanon' },
    { name: 'Lesotho', id: 'Lesotho' },
    { name: 'Liberia', id: 'Liberia' },
    { name: 'Libya', id: 'Libya' },
    { name: 'Liechtenstein', id: 'Liechtenstein' },
    { name: 'Lithuania', id: 'Lithuania' },
    { name: 'Luxembourg', id: 'Luxembourg' },
    { name: 'Macedonia', id: 'Macedonia' },
    { name: 'Madagascar', id: 'Madagascar' },
    { name: 'Malawi', id: 'Malawi' },
    { name: 'Malaysia', id: 'Malaysia' },
    { name: 'Maldives', id: 'Maldives' },
    { name: 'Mali', id: 'Mali' },
    { name: 'Malta', id: 'Malta' },
    { name: 'Marshall Islands', id: 'Marshall Islands' },
    { name: 'Mauritania', id: 'Mauritania' },
    { name: 'Mauritius', id: 'Mauritius' },
    { name: 'Mexico', id: 'Mexico' },
    { name: 'Micronesia', id: 'Micronesia' },
    { name: 'Moldova', id: 'Moldova' },
    { name: 'Monaco', id: 'Monaco' },
    { name: 'Mongolia', id: 'Mongolia' },
    { name: 'Montenegro', id: 'Montenegro' },
    { name: 'Morocco', id: 'Morocco' },
    { name: 'Mozambique', id: 'Mozambique' },
    { name: 'Myanmar, {Burma}', id: 'Myanmar, {Burma}' },
    { name: 'Namibia', id: 'Namibia' },
    { name: 'Nauru', id: 'Nauru' },
    { name: 'Nepal', id: 'Nepal' },
    { name: 'Netherlands', id: 'Netherlands' },
    { name: 'New Zealand', id: 'New Zealand' },
    { name: 'Nicaragua', id: 'Nicaragua' },
    { name: 'Niger', id: 'Niger' },
    { name: 'Nigeria', id: 'Nigeria' },
    { name: 'Norway', id: 'Norway' },
    { name: 'Oman', id: 'Oman' },
    { name: 'Pakistan', id: 'Pakistan' },
    { name: 'Palau', id: 'Palau' },
    { name: 'Panama', id: 'Panama' },
    { name: 'Papua New Guinea', id: 'Papua New Guinea' },
    { name: 'Paraguay', id: 'Paraguay' },
    { name: 'Peru', id: 'Peru' },
    { name: 'Philippines', id: 'Philippines' },
    { name: 'Poland', id: 'Poland' },
    { name: 'Portugal', id: 'Portugal' },
    { name: 'Qatar', id: 'Qatar' },
    { name: 'Romania', id: 'Romania' },
    { name: 'Russian Federation', id: 'Russian Federation' },
    { name: 'Rwanda', id: 'Rwanda' },
    { name: 'St Kitts & Nevis', id: 'St Kitts & Nevis' },
    { name: 'St Lucia', id: 'St Lucia' },
    { name: 'Saint Vincent & the Grenadines', id: 'Saint Vincent & the Grenadines' },
    { name: 'Samoa', id: 'Samoa' },
    { name: 'San Marino', id: 'San Marino' },
    { name: 'Sao Tome & Principe', id: 'Sao Tome & Principe' },
    { name: 'Saudi Arabia', id: 'Saudi Arabia' },
    { name: 'Senegal', id: 'Senegal' },
    { name: 'Serbia', id: 'Serbia' },
    { name: 'Seychelles', id: 'Seychelles' },
    { name: 'Sierra Leone', id: 'Sierra Leone' },
    { name: 'Singapore', id: 'Singapore' },
    { name: 'Slovakia', id: 'Slovakia' },
    { name: 'Slovenia', id: 'Slovenia' },
    { name: 'Solomon Islands', id: 'Solomon Islands' },
    { name: 'Somalia', id: 'Somalia' },
    { name: 'South Africa', id: 'South Africa' },
    { name: 'South Sudan', id: 'South Sudan' },
    { name: 'Spain', id: 'Spain' },
    { name: 'Sri Lanka', id: 'Sri Lanka' },
    { name: 'Sudan', id: 'Sudan' },
    { name: 'Suriname', id: 'Suriname' },
    { name: 'Swaziland', id: 'Swaziland' },
    { name: 'Sweden', id: 'Sweden' },
    { name: 'Switzerland', id: 'Switzerland' },
    { name: 'Syria', id: 'Syria' },
    { name: 'Taiwan', id: 'Taiwan' },
    { name: 'Tajikistan', id: 'Tajikistan' },
    { name: 'Tanzania', id: 'Tanzania' },
    { name: 'Thailand', id: 'Thailand' },
    { name: 'Togo', id: 'Togo' },
    { name: 'Tonga', id: 'Tonga' },
    { name: 'Trinidad & Tobago', id: 'Trinidad & Tobago' },
    { name: 'Tunisia', id: 'Tunisia' },
    { name: 'Turkey', id: 'Turkey' },
    { name: 'Turkmenistan', id: 'Turkmenistan' },
    { name: 'Tuvalu', id: 'Tuvalu' },
    { name: 'Uganda', id: 'Uganda' },
    { name: 'Ukraine', id: 'Ukraine' },
    { name: 'United Arab Emirates', id: 'United Arab Emirates' },
    { name: 'United Kingdom', id: 'United Kingdom' },
    { name: 'United States', id: 'United States' },
    { name: 'Uruguay', id: 'Uruguay' },
    { name: 'Uzbekistan', id: 'Uzbekistan' },
    { name: 'Vanuatu', id: 'Vanuatu' },
    { name: 'Vatican City', id: 'Vatican City' },
    { name: 'Venezuela', id: 'Venezuela' },
    { name: 'Vietnam', id: 'Vietnam' },
    { name: 'Yemen', id: 'Yemen' },
    { name: 'Zambia', id: 'Zambia' },
    { name: 'Zimbabwe', id: 'Zimbabwe' },
  ]),

  countriesSorting: Object.freeze([ 'name' ]),
  sortedCountries: sort('selectedCountries', 'countriesSorting'),

  actions: {
    toggleCountry(country) {
      if (this.selectedCountries.includes(country)) {
        this.selectedCountries.removeObject(country);
      } else {
        this.selectedCountries.pushObject(country);
      }
    }
  },

  templateSnippet: dedent`
    {{#animated-each sortedCountries use=transition as |country|}}
      ...
    {{/animated-each}}
  `,

  componentSnippet: dedent`
    import Component from '@ember/component';
    import move from 'ember-animated/motions/move';
    import { fadeOut, fadeIn } from 'ember-animated/motions/opacity';

    export default Component.extend({

      transition: function*({ keptSprites, insertedSprites, removedSprites }) {
        insertedSprites.forEach(sprite => {
          fadeIn(sprite);
        });

        removedSprites.forEach(sprite => {
          fadeOut(sprite);
        });
        
        keptSprites.forEach(sprite => {
          fadeIn(sprite);
          move(sprite);
        });
      },

      // ...

    });
  `,

  highlightedTemplateSnippet: computed(function() {
    return highlightCode(this.templateSnippet, 'hbs');
  }),

  highlightedComponentSnippet: computed(function() {
    return highlightCode(this.componentSnippet, 'js');
  })


});
