var Activity = require('../models/activities');

module.exports.getNameActByCode=async function(c){
  let act=await Activity.findOne({code:c});
  if(act)return act.name;
  return null;
}
module.exports.addTempCheckin=async function(c,id,n,ip,t,tk){let act = await Activity.findOne({code: c}); if(!act)return null;
  let tempCheckin = {
    id: id,
    name: n,
    ipCheckin: ip,
    timezone: t,
    checkinAt: null,
    token: tk,
    createAt: new Date()
  };
  act.listCheckin.push(tempCheckin);
  await act.save({}, err=>{
    if(err) console.log('== ERROR = Add temp checkin client = Err: '+err);
  });
}
module.exports.isCheckedIn=async function(c,id){let act = await Activity.findOne({code: c}); if(!act)return false;
let isExist = false;
let isChecked = false;
for(var x = 0; x < act.listCheckin.length; x++) if(id == act.listCheckin[x].id) {isExist = true; if(act.listCheckin[x].isChecked) isChecked = true;}
return {exists: isExist, checked: isChecked};
}
module.exports.isTokenUsed=async function(c,id,token){let act = await Activity.findOne({code: c}); if(!act)return false;
let orn = {
  i:{name: "", time: ""},
  s:false
}
for(var x = 0; x < act.listCheckin.length; x++) if(token == act.listCheckin[x].token && id != act.listCheckin[x].id) {orn.i.name = act.listCheckin[x].name; orn.i.time = act.listCheckin[x].createAt; orn.s = true};
return orn;
}
module.exports.isActHaveFileCheckin=async function(c){let act=await Activity.findOne({code:c});if(!act)return null;if(act.isHaveFile)return true;return false;}