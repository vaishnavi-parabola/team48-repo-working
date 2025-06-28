import { Search, Shield } from 'lucide-react';

interface HeaderProps {
    currentDate: Date;
}

const Header: React.FC<HeaderProps> = ({ currentDate }) => {
    return (
        <div className="bg-white px-8 py-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Welcome, Senior Inspector!</h1>
                    <p className="text-gray-600 mt-1">
                        Command Center Dashboard - {currentDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search incidents, officers..."
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                        />
                    </div>
                    <div>
                        <Shield className="w-6 h-6 text-white" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Header;