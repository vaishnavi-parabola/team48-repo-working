import { Shield, Phone } from 'lucide-react';

interface TeamMember {
    id: number;
    name: string;
    rank: string;
    badge: string;
    status: 'On Duty' | 'Available' | 'On Leave';
    currentTask: string;
    phone: string;
}

interface TeamDirectoryProps {
    members: TeamMember[];
}

const TeamDirectory: React.FC<TeamDirectoryProps> = ({ members }) => {
    return (
        <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Team Directory</h2>
            <div className="space-y-4">
                {members.map((member) => (
                    <div key={member.id} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Shield className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-gray-900">{member.name}</h3>
                            <p className="text-xs text-gray-600">{member.rank} - {member.badge}</p>
                            <p className="text-xs text-gray-500">{member.currentTask}</p>
                            <div className="flex items-center justify-between mt-1">
                                <span className={`text-xs font-medium ${member.status === 'On Duty' ? 'text-green-600' :
                                        member.status === 'Available' ? 'text-blue-600' :
                                            'text-gray-600'
                                    }`}>
                                    {member.status}
                                </span>
                                <button className="text-blue-600 hover:text-blue-800">
                                    <Phone className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TeamDirectory;