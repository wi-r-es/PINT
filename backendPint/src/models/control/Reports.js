module.exports = (sequelize, DataTypes) => {
    const Reports = sequelize.define('Reports', {
        report_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        reporter_id: { type: DataTypes.INTEGER, allowNull: false },
        comment_id: { type: DataTypes.INTEGER, allowNull: false },
        observation: { type: DataTypes.STRING(255), allowNull: true  },
        report_date: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.literal('CURRENT_TIMESTAMP') }
    }, {
        schema: 'control',
        tableName: 'reports',
        timestamps: false
    });

    Reports.associate = function(models) {
        Reports.belongsTo(models.Users, { foreignKey: 'reporter_id', targetKey: 'user_id', schema: 'hr', onDelete: 'CASCADE' });
        Reports.belongsTo(models.Comments, { foreignKey: 'comment_id', targetKey: 'comment_id', schema: 'communication' });
    };

    return Reports;
};
