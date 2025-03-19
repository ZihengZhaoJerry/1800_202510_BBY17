function writeSlang() {
    //define a variable for the collection you want to create in Firestore to populate data
    var SlangPost = db.collection("public_posts");

    const slangList = [
        { Slang: "Bruv", ShortDesc: "Different way of saying bro" },
        { Slang: "Homie", ShortDesc: "Another term for best friend" }
    ];
    
    slangList.forEach(async (slang) => {
        let querySnapshot = await SlangPost.where("Slang", "==", slang.Slang).get();

        if (querySnapshot.empty) {
            await SlangPost.add(slang);
            console.log(`Added: ${slang.Slang}`);
        } else {
            console.log(`Already exists: ${slang.Slang}`);
        }
    });
}

writeSlang();

function readQuote(documentId) {
    db.collection("public_posts").doc(documentId)                                                         //name of the collection and documents should matach excatly with what you have in Firestore
        .onSnapshot(documentId => {                                                              //arrow notation
            console.log("current document data: " + documentId.data());                          //.data() returns data object
            document.getElementById("slang-goes-here").innerHTML = documentId.data();      //using javascript to display the data on the right place

            //Here are other ways to access key-value data fields
            //$('#quote-goes-here').text(dayDoc.data().quote);         //using jquery object dot notation
            //$("#quote-goes-here").text(dayDoc.data()["quote"]);      //using json object indexing
            //document.querySelector("slang-goes-here").innerHTML = docSnapshot.data().quote;

        }, (error) => {
            console.log ("Error calling onSnapshot", error);
        });
    }
 readQuote("Homie");        //calling the function