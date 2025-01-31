const mongoose=require('mongoose')
const UserSchema=new mongoose.Schema({
      name : {
         type : String,
         required:[true,'username is required'],
         trim:true
      },
      email:{
         type:String,
         required:[true,'email is required'],
         trim:true,
         unique:true,
         lowercase:true,
         match:[/\S+@\S+\.\S+/, 'Please enter a valid email address']
      },
      password:{
         type:String,
         required:function (){
            return !this.googleId
         },
         minlength: [6, 'Password must be at least 6 characters long'],
         validate:{
            validator: function(value){
                return /^(?=.*[A-Z])(?=.*[\W_]).{6,}$/.test(value);
            },
            message: 'Password must contain at least one uppercase letter and one special character'
         }
      },
      googleId:{
         type:String,
         unique:true,
         sparse:true
      },
      usertrips:[{
         type:mongoose.Schema.Types.ObjectId,
         ref:'Trip'
      }]
}, { timestamps: true });
module.exports = mongoose.model('User', UserSchema);