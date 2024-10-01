module.exports = (sequelize, DataTypes) => {
    const Posts = sequelize.define('Posts', {
        post_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        sub_area_id: { type: DataTypes.INTEGER, allowNull: false },
        office_id: { type: DataTypes.INTEGER, allowNull: false },
        admin_id: { type: DataTypes.INTEGER },
        publisher_id: { type: DataTypes.INTEGER, allowNull: false },
        creation_date: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.literal('CURRENT_TIMESTAMP') },
        type: { type: DataTypes.CHAR(1), allowNull: false, defaultValue: 'N' },
        validated: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
        title: { type: DataTypes.STRING(255), allowNull: false },
        content: { type: DataTypes.TEXT, allowNull: true },
        price: { type: DataTypes.INTEGER, allowNull: true },
        p_location: { type: DataTypes.STRING(255) },
        filepath: { type: DataTypes.TEXT, allowNull: true},
    }, {
        schema: 'dynamic_content',
        tableName: 'posts',
        timestamps: false
    });

    Posts.associate = function(models) {
        Posts.belongsTo(models.OfficeAdmins, {as: 'Office_admin', foreignKey: 'office_id', targetKey: 'office_id', schema: 'centers', onDelete: 'CASCADE' });
        Posts.belongsTo(models.Offices, {as: 'Office', foreignKey: 'office_id', targetKey: 'office_id', schema: 'centers', onDelete: 'CASCADE' });
        Posts.belongsTo(models.SubArea, { foreignKey: 'sub_area_id', targetKey: 'sub_area_id', schema: 'static_content' });
        Posts.belongsTo(models.Users, { as: 'Publisher', foreignKey: 'publisher_id', targetKey: 'user_id', schema: 'hr', onDelete: 'CASCADE' });
        Posts.belongsTo(models.Users, { as: 'Admin', foreignKey: 'admin_id', targetKey: 'user_id', schema: 'hr', onDelete: 'SET NULL' });
        Posts.hasOne(models.Scores, { as: 'Score', foreignKey: 'post_id', targetKey: 'post_id', schema: 'dynamic_content', onDelete: 'CASCADE' });

    };

    return Posts;
};
