const Sequelize = require('sequelize');
require('dotenv').config();

const USER = process.env.SQL_USER || 'root';
const PASSWORD = process.env.SQL_PASSWORD || 'password';

// Creates connection. As a matter of flexiblity, security, and habit the password has been moved to .env
// May move user name to .env incase of same reasons stated for password 
const sequelize = new Sequelize('bandtogether', USER, PASSWORD, {
  host: 'localhost',
  // port: 3306, // default port for mysql. There incase anyone needs it.
  dialect: 'mysql',
});

// checks to see if sequelize has correctly connected to the database and give an error if it hasn't.
sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });


const Model = Sequelize.Model;



// The basic account information required to make an account and used to log in. Will have a one-to-one 
// relationship as the source with artist
class Account extends Model {};
Account.init({
  username: {
    type:Sequelize.STRING,
    unique: true,
    allowNull: false,
  },
  password: {
    type:Sequelize.STRING,
    unique: true,
    allowNull: false,
  },
  salt: {
    type:Sequelize.STRING,
    unique: false,
    allowNull: false,
  },
  email: {
    type:Sequelize.STRING,
    unique: true,
    allowNull: false,
  },
}, {
  sequelize, 
  modelName: 'account',
  freezeTableName: true,
  underscored: true,
});


// Basic info on the Artist. Will have a one-to-one relationship with Account through an account_id column.
// Will have a one-to-many relationship as the source with listings
class Artist extends Model {};
Artist.init({
  name: {
    type:Sequelize.STRING,
    allowNull: false,
  },
  city: Sequelize.STRING,
  state: Sequelize.STRING,
  genre: Sequelize.STRING,
  solo: Sequelize.BOOLEAN,
  birthday: Sequelize.BIGINT(8),
  image_url: Sequelize.STRING,
  bio: Sequelize.STRING(500), // may need to increase
  bandcamp_url: Sequelize.STRING,
  facebook_url: Sequelize.STRING,
  spotify_url: Sequelize.STRING,
  homepage_url: Sequelize.STRING,
  contact_email: Sequelize.STRING, // need to make one of the last three required
  contact_num: Sequelize.BIGINT(12), 
  contact_facebook: Sequelize.STRING,
}, {
  sequelize,
  modelName: 'artist',
  freezeTableName: true,
  underscored: true,
  timestamps: false,
});

// holds the listings for bands to get together. Has a one-to-many relationship as the target with Artist. Col name of
// foriegn key will be artist_id.
class Listing extends Model {};
Listing.init({
  title: Sequelize.STRING,
  date: Sequelize.BIGINT(8),
  description: Sequelize.STRING(700),
  venue: Sequelize.STRING,
  type: Sequelize.STRING,
  image_url: Sequelize.STRING,
}, {
  sequelize,
  modelName: 'listing',
  freezeTableName: true,
  underscored: true,
});

Artist.belongsTo(Account);
Account.hasOne(Artist);

Artist.hasMany(Listing);

// must sync to create tabels and associations.
sequelize.sync()
  .then(() => {
  })
  .catch(err => {console.error(err)});

module.exports = {
  Account,
  Artist,
  Listing,
  sequelize
};