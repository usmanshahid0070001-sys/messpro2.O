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
    // Some hostels created with the original schema store `plan` as a string
    // (for example, "Basic"). Hydrating those records with the current schema,
    // where `plan` is an object, makes Mongoose throw before the API can return
    // any hostels. A lean query returns the stored data without document
    // hydration and keeps the endpoint compatible with both record formats.
    return await Hostel.find({}).sort({ createdAt: -1 }).lean();
  }


  async findById(id){
    return await Hostel.findById(id);
  }

  async delete(id){
    return await Hostel.findByIdAndDelete(id);
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

  async updateLimitCount(id, field, count) {
    return await Hostel.findByIdAndUpdate(
      id,
      { $set: { [field]: count } },
      { new: true }
    );
  }
}

export default new HostelRepository();
