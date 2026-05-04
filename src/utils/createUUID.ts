import { customAlphabet } from "nanoid";
import { User } from "../models/user.model";


// Create a custom alphabet of numbers only
const nanoid = customAlphabet("0123456789", 6); // Generates a 6-digit numeric ID

const createUserUUID = async () => {
  let uniqueId;
  let doesExist;
  do {
    uniqueId = nanoid();
    doesExist = await User.findOne({ uuid: uniqueId });
  } while (doesExist);
  return uniqueId;
};

export default createUserUUID;
