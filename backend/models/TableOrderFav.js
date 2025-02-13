import mongoose from 'mongoose';


const TableOrderFavSchema = new mongoose.Schema({
    loginUserId: String,
    AdminId: String,
    OrgId: String,
    


    ColumnName : String,
    UserPref : Object,

  

}, { timestamps: true });

const TableOrderFav = mongoose.model('tableorderfav', TableOrderFavSchema, 'tableorderfav');


// Export the model
export default  TableOrderFav ;
