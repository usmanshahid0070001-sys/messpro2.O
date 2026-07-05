import hostelRepository from "./hostel.repository.js"

class HostelService{
    async registerHostel(data){
    //Business rule 1:is name already taken?
    const existingName=await hostelRepository.findByName(data.name);
    if(existingName){
        throw new Error('A hostel with this name is already registered.');
    }
//Business rule 2: is teh domain already taken?
const existingSubdomain=await hostelRepository.findBySubdomain(data.subdomain)
if (existingSubdomain) {
      throw new Error('This subdomain is already in use. Please choose another.');
    }
    return await hostelRepository.create(data)
    }   
    


async getAllHostels(){
    return await hostelRepository.findAll();
}


async updateHostelSettings(hostelId,newSettingsData){
    //phaly ya check kry gy jo hostel id ai ha woo hostel exist bhi krta ha ya nhi 
    const hostel=await hostelRepository.findById(hostelId)
    if (!hostel) {
      throw new Error('Hostel not found.');
    }

    //ya line hamri existing settings ko new ky sath mila dy gi 
    const mergedSettings = { ...hostel.settings, ...newSettingsData };


    return await hostelRepository.updateSettings(hostelId,mergedSettings);
}

}

export default new HostelService();