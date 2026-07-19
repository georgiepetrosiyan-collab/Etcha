import { Link } from 'react-router-dom';
import ArrowBack from '@mui/icons-material/ArrowBack';
import Card from '../Card/card'; 

const BackButton = () => {
    return (
        <div className="my-5">
            <Card shrink className="w-fit hover:bg-gray-50 p-2">
                <Link to="/feeds" className="flex justify-between items-center cursor-pointer p-1 rounded transition-colors">
                    <ArrowBack sx={{ color: "gray" }} />
                </Link>
            </Card>
        </div>
    );
};

export default BackButton;