module.exports = (sequelize, DataTypes) => {
    const SubArea = sequelize.define('SubArea', {
        sub_area_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        area_id: { type: DataTypes.INTEGER, allowNull: false },
        title: { type: DataTypes.STRING(255), allowNull: false, unique: true },
        // icon_name: {type: DataTypes.STRING(50), allowNull:false}
    }, {
        schema: 'static_content',
        tableName: 'sub_area',
        timestamps: false
    });

    SubArea.associate = function(models) {
        SubArea.belongsTo(models.Area, { foreignKey: 'area_id', targetKey: 'area_id', schema: 'static_content' });
    };

    return SubArea;
};
