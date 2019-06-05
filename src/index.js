import React from './react'
import ReactDOM from './react-dom'

// const Welcome = (props) => {
//     return <h1>Hello,{props.name}</h1>;
// }

// function App() {
//     return (
//         <div>
//             <Welcome name="Sara" />
//             <Welcome name="Cahal" />
//             <Welcome name="Edite" />
//         </div>
//     );
// }
// ReactDOM.render(
//     <App />,
//     document.getElementById( 'root' )
// );

class Counter extends React.Component {
    constructor( props ) {
        super( props );
        this.state = {
            num: 0,
            s: "times"
        }
    }
    onClick() {
        this.setState( { num: this.state.num + 1 } );
    }

    render() {
        return (
            <div onClick={ () => this.onClick() }>
                Count:{this.state.num}{this.state.s}
            </div>
        );
    }
}
ReactDOM.render(
    <Counter />,
    document.getElementById( 'root' )
);
