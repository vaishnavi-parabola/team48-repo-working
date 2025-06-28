import { Link } from 'react-router-dom'; // Assuming React Router is used

interface ChatSummary {
  id: number;
  chatName: string;
  summary: string;
  lastSummarized: string;
  messageCount: number;
  priority: "High" | "Medium" | "Low";
}

interface RecentChatSummariesProps {
  summaries: ChatSummary[];
}

const RecentChatSummaries: React.FC<RecentChatSummariesProps> = ({ summaries }) => {
    return (
        <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Recent Chat Summaries</h2>
                <Link
                    to="/task-allocation"
                    className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                >
                    View All
                </Link>
            </div>
            <div className="space-y-4">
                {summaries.map((summary) => (
                    <div key={summary.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-2">
                            <h3 className="font-medium text-gray-900 text-sm">{summary.chatName}</h3>
                            <span className="text-xs text-gray-500">{summary.lastSummarized}</span>
                        </div>
                        <p className="text-xs text-gray-600 mb-3 leading-relaxed">{summary.summary}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{summary.messageCount} messages summarized</span>
                            <span className={`font-medium ${summary.priority === 'High' ? 'text-red-600' :
                                    summary.priority === 'Medium' ? 'text-yellow-600' :
                                        'text-green-600'
                                }`}>
                                {summary.priority} Priority
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecentChatSummaries;
