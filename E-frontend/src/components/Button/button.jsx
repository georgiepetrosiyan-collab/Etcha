const Button = (props) => {
    return (
        <div className="cursor-pointer py-2 px-4 rounded-xl bg-accent text-white font-semibold" onClick={props.onClick}>
            {props.children}
        </div>
    );
};

export default Button;