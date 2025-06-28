import {
  Shield,
  MapPin,
  Phone,
  Clock,
  UserCheck,
  User,
  Edit2,
} from "lucide-react";

interface UserProfileData {
  name: string;
  rank: string;
  badge: string;
  department: string;
  station: string;
  email: string;
  phone: string;
  yearsOfService: number;
  currentStatus: "On Duty" | "Available" | "On Leave";
  location: string;
}

interface UserProfileProps {
  profile: UserProfileData;
  role: "SI" | "SP";
}

const UserProfile: React.FC<UserProfileProps> = ({ profile, role }) => {
  return (
    <div className={`w-full ${role === "SP" ? "lg:col-span-2" : ""}`}>
      <div className="bg-white rounded-xl p-8 shadow-sm flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">
            Officer Profile
          </h2>
          <button className="text-blue-600 hover:text-blue-800">
            <Edit2 className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-center space-x-6 mb-4">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-12 h-12 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">{profile.name}</h3>
            <p className="text-sm text-gray-600 mt-2">Rank: {profile.rank}</p>
            <p className="text-sm text-gray-500">Badge: {profile.badge}</p>
          </div>
        </div>
        <div className="space-y-4 flex-1">
          <div className="flex items-center space-x-3 text-sm text-gray-600">
            <Shield className="w-5 h-5 text-blue-600" />
            <span className="font-semibold">
              Department: {profile.department}
            </span>
          </div>
          <div className="flex items-center space-x-3 text-sm text-gray-600">
            <MapPin className="w-5 h-5 text-blue-600" />
            <span className="font-semibold">Station: {profile.station}</span>
          </div>
          <div className="flex items-center space-x-3 text-sm text-gray-600">
            <Phone className="w-5 h-5 text-blue-600" />
            <span className="font-semibold">Contact: {profile.phone}</span>
          </div>
          <div className="flex items-center space-x-3 text-sm text-gray-600">
            <Clock className="w-5 h-5 text-blue-600" />
            <span className="font-semibold">
              Years of Service: {profile.yearsOfService}
            </span>
          </div>
          <div className="flex items-center space-x-3 text-sm text-gray-600">
            <UserCheck className="w-5 h-5 text-blue-600" />
            <span className="font-semibold">
              Status:{" "}
              <span
                className={
                  profile.currentStatus === "On Duty"
                    ? "text-green-600"
                    : "text-gray-600"
                }
              >
                {profile.currentStatus}
              </span>
            </span>
          </div>
          <div className="flex items-center space-x-3 text-sm text-gray-600">
            <MapPin className="w-5 h-5 text-blue-600" />
            <span className="font-semibold">Location: {profile.location}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
