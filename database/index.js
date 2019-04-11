const bcrypt = require('bcryptjs');
const { Account, Artist, Listing } = require('./config.js');


// start of profile and account Middleware
const optionalProfileValues = ['city', 'state', 'genre', 'birthday', 'image_url', 'bio', 'bandcamp_url', 'facebook_url', 
  'spotify_url', 'homepage_url', 'contact_email', 'contact_num', 'contact_facebook'];

/**
 * makes an object with certain variables, ignoring ones that are undefined by default.
 * @param {object} object - the object who's props are being taken.
 * @param {array} propsToTake - a list of properties to add to the object.
 * @param {boolean} allowNull - true to allow variables set to undefined or null.
 * @returns {Object}
 */
const makeObject = (object, propsToTake, allowNull = false) => {
  let returnObject = {}
  for(let key in object) {
    if(object[key] !== null && object[key] !== undefined || allowNull) {
      if (propsToTake.indexOf(key) !== -1) {
        returnObject[key] = object[key];
      }
    }
  }
  return returnObject;
};



/**
 * Creates an object with id or username properties for a search. if neither are given then it returns undefined.
 * @param {account} - must have an account by id or username listed in the account table. If both are given will use id.
 * @returns {object}
 */
const makeSearchObject = (account) => {
  const { id, username } = account;
  const acc = {};
  // makes an object to use for search
  if(!username && !id) {
    console.error("please give id or username property in the account argument");
    return;
  }
  if(!username) {
    acc.id = id;
  } else if (!id) {
    acc.username = username;
  } else {
    acc.id = id;
  }
  return acc;
};



/**
 * creates an account and an associated band or musician. I haven't worked out the kinks for returning an error yet, so for now,
 * it just console.errors an error message.
 * @param {object} accDetails - requires the properties of username, password, salt, name, solo, and email are all required.
 * city, state, genre, birthday, image_url, image_url, bio, bandcamp_url, facebook_url, spotify_url, homepage_url, 
 * contact_email, contact_num, or contact_facebook.
 * @returns {Promise} 
 */
const makeAccount = (accDetails) => {
<<<<<<< HEAD
  console.log(accDetails)
  accDetails.salt = bcrypt.genSaltSync(10);
  accDetails.password = bcrypt.hashSync(accDetails.password, accDetails.salt);
  return Account.create(accDetails);

  // const {username, password, salt, email, name, solo} = accDetails;
  // if(!username || !password || !salt || !name || !solo || !email) {
  //   console.error("Attempted to make an account without required fields.")
  //   return;
  // }
  // const artistObj = makeObject(accDetails, ['name', 'solo'].concat(optionalProfileValues))
  // // makes account
  // return Account.create({ username, password, salt, email })
  // // makes artist
  // .then(account => Artist.create(artistObj)
  //   // associates the new artist and account
  //   .then(artist => artist.setAccount(account.id))
  // )
=======
  const {username, password, salt, email, name, solo} = accDetails;
  if(!username || !password || !salt || !name || solo === undefined || !email) {
    console.error(`Attempted to make an account without required fields. username: ${username}, password: ${password},
      salt: ${salt}, name: ${name}, solo: ${solo}, email: ${email}`);
    return;
  }
  const artistObj = makeObject(accDetails, ['name', 'solo'].concat(optionalProfileValues));
  if(solo === 0) {
    artistObj.solo = false;
  } else if (solo === 1) {
    artistObj.solo = true;
  }
  // makes account
  return Account.create({ username, password, salt, email })
  // makes artist
  .then(account => Artist.create(artistObj)
    // associates the new artist and account
    .then(artist => artist.setAccount(account.id))
  )
>>>>>>> 08ab87c7390d514a2157040490ba6e3cfebb6917
};



/**
 * Updates an account by id or username. If both are given will use id. Only adds or changes information. Does not remove it.
 * Does not allow for updating name or solo. 
 * @param {object} account - must have an account by id or username listed in the account table. If both are given will use id.
 * @param {object} update - properties to change. All are optional: city, state, genre, birthday, image_url, bio, 
 * bandcamp_url, facebook_url, spotify_url, homepage_url, contact_email, contact_num, contact_facebook.
 */
const updateArtistDetails = (account, update) => {
  const acc = makeSearchObject(account);
  if (!acc) return; 
  const updateObject = makeObject(update, optionalProfileValues);
  return Account.findOne(acc)
  // gets the associated artist
  .then(account => account.getArtist())
  // updates that artist
  .then(artist => artist.update(updateObject));
};



/**
 * deletes values from the database.
 * @param {object} account - must have an account by id or username listed in the account table. If both are given will use id.
 * @param {array} removeValues - array of values as strings to delete. Includes:city, state, genre, birthday, image_url, bio, 
 * bandcamp_url, facebook_url, spotify_url, homepage_url, contact_email, contact_num, contact_facebook.
 */
const deleteArtistData = (account, removeValues) => {
  if(!Array.isArray(removeValues)){
    removeValues = [removeValues];
  }
  const acc = makeSearchObject(account);
  if (!acc) return;
  // makes an object to delete
  const updateObject = removeValues.reduce((seed, value) => {
    if(optionalProfileValues.indexOf(value) !== -1) {
      seed[value] = null;
    }
    return seed;
  }, {});
  return Account.findOne(acc)
  // gets the associated artist
  .then(account => account.getArtist())
  // updates that artist
  .then(artist => artist.update(updateObject));
};



/**
 * Retrieves information from the account table (id, username, password, salt, email).
 * @param {object} account - must have an account by id or username listed in the account table. If both are given will use id.
 * @returns {Promise}
 */
const getAccountInformation = (account) => {
  const acc = makeSearchObject(account);
  if (!acc) return;
  return Account.findOne(acc);
};



/**
 * @param {object} account - must have an account by id or username listed in the account table. If both are given will use id.
 * @returns {Promise} - with an object containing account id, account email, and all other artist table columns.
 */
const getProfileInformation = (account) => {
  const acc = makeSearchObject(account);
  if (!acc) return;
  return Account.findOne(acc)
  .then(account => account.getArtist()
    .then(artist => {
      // builds object to be returned in promis
      const profileObject = {id: account.id, email: account.email, name: artist.name};
      optionalProfileValues.forEach(value => {
        profileObject[value] = artist[value];
      });
      return profileObject;
    }));
};



// start of listing Middleware

const listingValues = ['title', 'date', 'description', 'venue', 'type', 'image_url'];

/**
 * Makes a new listing.
 * @param {Object} account - must have an account by id or username listed in the account table. If both are given will use id.
 * @param {object} newListing - must have title, date, description, and venue.
 * @returns {object} - sequelize promise with the artist of the listing.
 */
const makeListing = (account, newListing) => {
  const acc = makeSearchObject(account);
  if (!acc) return;
  const {title, date, description, venue} = newListing;
  if (!title || !date || !description || !venue) {
    console.error("Attempted to make a listing without required fields.")
    return;
  }
  const newListingObject = makeObject(newListing, listingValues);
  return Account.findOne({where: acc})
    .then(account => account.getArtist())
    .then(artist => Listing.create(newListingObject)
      .then(listing => artist.addListing(listing.id))
    );
};



/**
 * 
 * @param {object} filter - fields include title, date, description, venue, type, and image_url. leaving this object empty
 * or undefined returns all listings.
 */
const getListings = (filter) => {
  if(!filter) {
    return Listing.findAll();
  }
  const listingFilters = makeObject(filter, listingValues.concat(['id', 'artist_id']));
  return Listing.findAll({where: listingFilters});
};


/**
 * 
 * a function to get all the artists in the db
 * @returns {Promise}
 */
const getAllArtists = () => {
  return Artist.findAll()
}


/**
 * 
 * @param {number} id - id of the listing being updated.
 * @param {object} update - an object with listing properties to update. 
 * @returns {Promise}
 */
const updateListings = (id, update) => {
  const updateObject = makeObject(update, listingValues);
  return Listing.update(updateObject, {where: {id}})
};



/**
 * removes type and/or image_url from a table row.
 * @param {number} id - id of the listing being effected.
 * @param {array} propsToRemove - contains a string of type and/or image.
 */
const deleteListingProperties = (id, propsToRemove) => {
  const updateObject = {};
  if(propsToRemove.indexOf("type") !== -1) {
    updateObject.type = null;
  }
  if(propsToRemove.indexOf("image_url") !== -1) {
    updateObject.image_url = null;
  }
  return Listing.update(updateObject, {where: {id}});
};



/**
 * @param {number} id - id of listing to be deleted. 
 * @return {Promise} - sequelize promise containing the deleted data.
 */
const deleteListing = (id) => {
  return Listing.findOne({id})
    .then(listing => listing.destroy());
};



/**
 * 
 * @param {NUMBER} id - number
 * @returns array of sequalize objects.
 */
const getListingsByAccountId = (id) => {
  return Account.findOne({where: {id}})
    .then(account => account.getArtist())
    .then(artist => artist.getListings());
};



module.exports = {
  makeAccount,
  updateArtistDetails,
  deleteArtistData,
  getAccountInformation,
  getProfileInformation,
  makeListing,
  getListings,
  getAllArtists,
  updateListings,
  deleteListingProperties,
  deleteListing,
  getListingsByAccountId,
};
