const Button = (props) => {
    return (
        <div className="cursor-pointer px-2 py-4 rounded-xl bg-accent text-white font-semibold" onClick={props.onClick}>
            {props.children}
        </div>
    );
};

export default Button;