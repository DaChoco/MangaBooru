import { useState } from "react";
import { PageNumContext } from "./pageNumContext";

function PageContext({children}){
    const [page, setPage] = useState(()=> {
        const storedPage = sessionStorage.getItem("pagenumber")
        return storedPage ? parseInt(storedPage) : 1})

    return (
        <PageNumContext.Provider value={{page, setPage}}>
            {children}
        </PageNumContext.Provider>
    )
}

export default PageContext