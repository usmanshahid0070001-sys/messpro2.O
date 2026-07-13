import Hostel from './hostel.model.js'

class HostelRepository{
    async create(hostelData){
      return await  Hostel.create(hostelData);
    }

    async findByName(name){
       return  await Hostel.findOne({name});
    }


    async findBySubdomain(subdomain) {
    return await Hostel.findOne({ subdomain });
  }


  async findAll(){
    return await Hostel.find({}).sort({ createdAt: -1 });
  }


  async findById(id){
    return await Hostel.findById(id);
  }

  async updateHostel(id, updateData){
    return await Hostel.findByIdAndUpdate(id,
        {
            $set: updateData
        },
        {
            new:true,
            runValidators:true
        }
    )
  }
}

export default new HostelRepository();