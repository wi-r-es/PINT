const Sequelize = require("sequelize");
const validator = require("validator");
module.exports = (sequelize, DataTypes) => {
  const Users = sequelize.define(
    "Users",
    {
      user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      //employee_id: { type: DataTypes.UUID, allowNull: false, defaultValue: Sequelize.UUIDV4 },
      first_name: {
        type: DataTypes.STRING(30),
        allowNull: false,
        validate: {
          notNull: { msg: "First name is required" },
          notEmpty: { msg: "First name cannot be empty" },
          isAlpha: { msg: "First name must contain only letters" },
        },
      },
      last_name: {
        type: DataTypes.STRING(30),
        allowNull: false,
        validate: {
          notNull: { msg: "Last name is required" },
          notEmpty: { msg: "Last name cannot be empty" },
          isAlpha: { msg: "Last name must contain only letters" },
        },
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
          notNull: { msg: "Email is required" },
          notEmpty: { msg: "Email cannot be empty" },
          isEmail: { msg: "Email is not valid" },
          isValidEmail(value) {
            if (!validator.isEmail(value)) {
              throw new Error("Email is not valid");
            }
          },
        },
      },
      hashed_password: { type: DataTypes.STRING(255), allowNull: true },
      profile_pic: { type: DataTypes.TEXT, allowNull: true },
      role_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      join_date: { type: DataTypes.DATE, allowNull: false },
      last_access: {
        type: DataTypes.DATE,
        //defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
      },
      google_id: { type: DataTypes.STRING(255), allowNull: true },
      facebook_id: { type: DataTypes.STRING(255), allowNull: true },
      fcmToken: { type: DataTypes.STRING, allowNull:true}
    },
    {
      schema: "hr",
      tableName: "users",
      timestamps: false,
    }
  );

  Users.associate = function (models) {
    Users.belongsTo(models.AccPermissions, {
      foreignKey: "role_id",
      targetKey: "role_id",
      schema: "security",
    });
    Users.hasOne(models.OfficeWorkers, {
      foreignKey: "user_id",
      targetKey: "user_id",
      schema: "hr",
    });
  };

  return Users;
};
