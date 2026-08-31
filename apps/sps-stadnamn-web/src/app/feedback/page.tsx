import Footer from "../../components/layout/footer"


export default function Feedback() {
    return (
        <>
            <main className="flex flex-col w-full flex-grow">
                <iframe className="flex-grow" src="https://dialog.uib.no/UIB-61" />
            </main>
            <Footer />
        </>
    );
}
