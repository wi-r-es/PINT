const {
  spRegisterNewUser,
  spCreatePassword,
  spActivateUser,
  spSetCenterAdmin,
} = require("../database/logic_objects/securityProcedures");

const {sp_updateLastAccess} = require("../database/logic_objects/usersProcedures");

const insertAdmins = async () => {
  //Create Server Admin
  await spRegisterNewUser(
    "Server",
    "Admin",
    "softshares_15_05_00@yopmail.com",
    0
  );
  await spCreatePassword(16, "123456@Softshares");
  await spActivateUser(16);
  await spSetCenterAdmin(16, 0);

  //Create Centers Admins
  await spRegisterNewUser("Tomar", "Admin", "softshares_tomar@yopmail.com", 1);
  await spCreatePassword(17, "123456@Softshares-tomar");
  await spActivateUser(17);
  await spSetCenterAdmin(17, 1);
  await sp_updateLastAccess(17);

  await spRegisterNewUser("Viseu", "Admin", "softshares_viseu@yopmail.com", 2);
  await spCreatePassword(18, "123456@Softshares-viseu");
  await spActivateUser(18);
  await spSetCenterAdmin(18, 2);
  await sp_updateLastAccess(18);

  await spRegisterNewUser(
    "Fundao",
    "Admin",
    "softshares_fundao@yopmail.com",
    3
  );
  await spCreatePassword(19, "123456@Softshares-fundao");
  await spActivateUser(19);
  await spSetCenterAdmin(19, 3);

  await spRegisterNewUser(
    "Portalegre",
    "Admin",
    "softshares_portalegre@yopmail.com",
    4
  );
  await spCreatePassword(20, "123456@Softshares-portalegre");
  await spActivateUser(20);
  await spSetCenterAdmin(20, 4);

  await spRegisterNewUser(
    "VilaReal",
    "Admin",
    "softshares_vilareal@yopmail.com",
    5
  );
  await spCreatePassword(21, "123456@Softshares-vilareal");
  await spActivateUser(21);
  await spSetCenterAdmin(21, 5);

  await spRegisterNewUser(
    "test",
    "Admin",
    "test@yopmail.com",
    2
  );
  await spCreatePassword(22, "123456@Softshares");
  await spActivateUser(22);
  await spSetCenterAdmin(22, 2);

  await spRegisterNewUser(
    "Softinsa",
    "User",
    "softinsa@yopmail.com",
    2
  );
  await spCreatePassword(23, "123456@Softshares");
  await spActivateUser(23);

};

insertAdmins();

