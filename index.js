const { Keystone } = require("@keystonejs/keystone");
const { PasswordAuthStrategy } = require("@keystonejs/auth-password");
const {
  Text,
  Checkbox,
  Password,
  Relationship,
  Select,
  Decimal,
  Integer,
  isRequired,
} = require("@keystonejs/fields");
const { GraphQLApp } = require("@keystonejs/app-graphql");
const { AdminUIApp } = require("@keystonejs/app-admin-ui");
const initialiseData = require("./initial-data");
const GrapesJSEditor = require("keystonejs-grapesjs-editor");
const { MongooseAdapter: Adapter } = require("@keystonejs/adapter-mongoose");
const { type } = require("keystonejs-grapesjs-editor");
const PROJECT_NAME = "KSC";
const adapterConfig = {
  mongoUri:
    "mongodb+srv://karan:Password@12@cluster0.tq8oa.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
};

const keystone = new Keystone({
  adapter: new Adapter(adapterConfig),
  cookieSecret: "abc123",
  onConnect: process.env.CREATE_TABLES !== "true" && initialiseData,
});

// Access control functions
const userIsAdmin = ({ authentication: { item: user } }) => Boolean(user && user.isAdmin);
const userOwnsItem = ({ authentication: { item: user } }) => {
  if (!user) {
    return false;
  }
  return { id: user.id };
};

const userIsAdminOrOwner = (auth) => {
  const isAdmin = access.userIsAdmin(auth);
  const isOwner = access.userOwnsItem(auth);
  return isAdmin ? isAdmin : isOwner;
};

const access = { userIsAdmin, userOwnsItem, userIsAdminOrOwner };

keystone.createList("User", {
  fields: {
    name: { type: Text },
    email: {
      type: Text,
      isUnique: true,
    },
    isAdmin: {
      type: Checkbox,
      // Field-level access controls
      // Here, we set more restrictive field access so a non-admin cannot make themselves admin.
      access: {
        update: access.userIsAdmin,
      },
    },
    password: {
      type: Password,
    },
  },
  // List-level access controls
  access: {
    read: access.userIsAdminOrOwner,
    update: access.userIsAdminOrOwner,
    create: access.userIsAdmin,
    delete: access.userIsAdmin,
    auth: true,
  },
});
keystone.createList("Home", {
  fields: {
    name: { type: Text },
    content: {
      type: GrapesJSEditor,
    },
  },
});
keystone.createList("ProductNavbar", {
  fields: {
    name: { type: Text },
    url: { type: Text },
    navbarul: { type: Relationship, ref: "Navbar.navbarli" },
  },
});
keystone.createList("Navbar", {
  fields: {
    name: { type: Text },
    navbarli: { type: Relationship, ref: "ProductNavbar.navbarul", many: true },
  },
});

keystone.createList("CarInsuranceOnline", {
  fields: {
    name: { type: Text },
    content: {
      type: GrapesJSEditor,
    },
  },
});
keystone.createList("TwoWheelerInsurance", {
  fields: {
    name: { type: Text },
    content: {
      type: GrapesJSEditor,
    },
  },
});
keystone.createList("HomeInsurance", {
  fields: {
    content: {
      type: GrapesJSEditor,
    },
  },
});
keystone.createList("TravelInsurance", {
  fields: {
    content: {
      type: GrapesJSEditor,
    },
  },
});
keystone.createList("PersonalAccidentInsurance", {
  fields: {
    content: {
      type: GrapesJSEditor,
    },
  },
});
keystone.createList("CommercialVehicleInsurance", {
  fields: {
    content: {
      type: GrapesJSEditor,
    },
  },
});
keystone.createList("Footer", {
  fields: {
    content: {
      type: GrapesJSEditor,
    },
  },
});

keystone.createList("State", {
  fields: {
    name: { type: Text },
    city: { type: Relationship, ref: "City.state", many: true },
  },
});
keystone.createList("City", {
  fields: {
    name: { type: Text },
    state: { type: Relationship, ref: "State.city", many: false },
  },
});
keystone.createList("CityAddress", {
  fields: {
    name: { type: Text },
    city: { type: Relationship, ref: "City", many: false },
  },
});
keystone.createList("DownloadHeader", {
  fields: {
    name: { type: Text },
    list: { type: Relationship, ref: "DownloadList.header", many: true },
  },
});
keystone.createList("DownloadList", {
  fields: {
    name: { type: Text },
    url: { type: Text },
    header: { type: Relationship, ref: "DownloadHeader.list" },
  },
});
keystone.createList("ProductList", {
  fields: {
    name: { type: Text },
  },
});
keystone.createList("ContactForm", {
  fields: {
    name: {
      type: Text,
      isRequired: true,
    },
    number: { type: Decimal, isRequired: true },
    email: { type: Text, isRequired: true },
    city: { type: Text, isRequired: true },
    product: { type: Text, isRequired: true },
    comment: { type: Text, isRequired: true },
  },
});

const authStrategy = keystone.createAuthStrategy({
  type: PasswordAuthStrategy,
  list: "User",
  config: { protectIdentities: process.env.NODE_ENV === "production" },
});

module.exports = {
  keystone,
  apps: [
    new GraphQLApp(),
    new AdminUIApp({
      name: PROJECT_NAME,
      enableDefaultRoute: true,
      authStrategy,
    }),
  ],
};
