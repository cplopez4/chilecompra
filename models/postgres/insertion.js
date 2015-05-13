module.exports = function(sequelize, DataTypes) {
  var Insertion = sequelize.define('Insertion', {
    _id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV1, primaryKey: true },  
    code: { type: DataTypes.STRING, unique: true },                                    
    name: { type: DataTypes.STRING },                                                
    end_date: DataTypes.TEXT,
    states: DataTypes.ARRAY(DataTypes.STRING)                                                          
  })

  return Insertion
}