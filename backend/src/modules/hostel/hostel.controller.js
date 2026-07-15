import hostelService from "./hostel.service.js";
import { createHostelSchema, updateSettingsSchema, addHostelUserSchema } from './hostel.validation.js';
import { catchAsync } from "../../utils/catchAsync.js";

// export const createHostel=async (req,res)=>{
//     try {
//         const validateData=createHostelSchema.parse(req.body);

// const newHostel = await hostelService.registerHostel(validateData);

// //    Serialization: Convert the JS Object back to JSON and send a 201 Created status
//     res.status(201).json({ success: true, data: newHostel });

//     } catch (error) {
//         if(error.name==='ZodError'){
//             return res.status('400').json({
//                 success:false,
//                 error:error.errors.map(e=>e.message
//             )
//         }
//     )
//         }
//       //agr zod ka errror nhi to mtlb service error ha 
//         res.status(400).json({ success: false, message: error.message });
//     }

// };





// export const getHostels = async (req, res) => {
//   try {
//     // Ask the service for the data
//     const hostels = await hostelService.getAllHostels();

//     // Serialize and send the response[cite: 22]
//     res.status(200).json({ success: true, count: hostels.length, data: hostels });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };



// export const updateSettings=async(req,res)=>{

//     try {
//          //dynamic route ki id params my ati ha 
//     const hostelId=req.params.id

//     const validatedData=updateSettingsSchema.parse(req.body)


//     const updatedHostel=await hostelService.updateHostelSettings(hostelId,validatedData)
//     res.status(200).json({ success: true, data: updatedHostel });
//     } catch (error) {
//     if (error.name === 'ZodError') {
//       return res.status(400).json({ success: false, errors: error.errors.map(e => e.message) });
//     }
//     // If ID is malformed, mongoose throws a CastError
//     if (error.name === 'CastError') {
//       return res.status(400).json({ success: false, message: 'Invalid Hostel ID format.' });
//     }
//     res.status(400).json({ success: false, message: error.message });
//   }
// };



export const updateMyHostelSettings = catchAsync(async (req, res) => {
  // 1. Grab the hostel ID from the logged-in Admin
  const hostelId = req.user.hostelId;

  // 2. We reuse your existing updateHostelSettings service!
  // (Remember, your service already handles the "change the plan" logic perfectly)
  const updatedHostel = await hostelService.updateHostelSettings(hostelId, req.body);

  res.status(200).json({ 
    success: true, 
    message: "Hostel settings updated successfully.",
    data: updatedHostel 
  });
});

export const createHostel = catchAsync(async (req, res) => {
  const validatedData = createHostelSchema.parse(req.body);
  
  const newHostel = await hostelService.registerHostel(validatedData);
  res.status(201).json({ success: true, data: newHostel });
});

export const getHostels = catchAsync(async (req, res) => {
  const hostels = await hostelService.getAllHostels();
  res.status(200).json({ success: true, count: hostels.length, data: hostels });
});


export const getMyHostel = catchAsync(async (req, res) => {
  // We use the logged-in user's ID badge, NOT the URL parameters!
  const hostel = await hostelService.getHostelById(req.user.hostelId);

  res.status(200).json({ 
    success: true, 
    data: hostel 
  });
});

export const addHostelUser = catchAsync(async (req, res) => {
  const hostelId = req.params.id;
  const creatorRole = req.user.role;
  const validatedData = addHostelUserSchema.parse(req.body);
  const newUser = await hostelService.addHostelUser(creatorRole,hostelId, validatedData);
  res.status(201).json({ success: true, data: newUser });
});

export const updateSettings = catchAsync(async (req, res) => {
  const hostelId = req.params.id;
  const validatedData = updateSettingsSchema.parse(req.body);
  const updatedHostel = await hostelService.updateHostelSettings(hostelId, validatedData);
  res.status(200).json({ success: true, data: updatedHostel });
});


// export const getMyHostel = catchAsync(async (req, res) => {
//   res.status(200).json({ success: true, message: "getMyHostel route is alive!" });
// });

// export const updateMyHostelSettings = catchAsync(async (req, res) => {
//   res.status(200).json({ success: true, message: "updateMyHostelSettings route is alive!" });
// });