import {Link} from "react-router-dom"

function Footer(){
    return (<div className="rest-footer">
        <h1 className="footer-big-text"><a href="https://github.com/DaChoco/MangaBooru">GitHub Repo</a></h1>
    
        <ul className="optionslist">
            <li><Link to="/posts">Browse</Link></li>
            <li>Help</li>
        </ul>
    </div>)
    
}

export default Footer


