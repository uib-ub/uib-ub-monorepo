# About UBBONT to LA Object Mapper

This mapper is responsible for converting UBBONT objects to LA objects. 

## Notes

* bibo:publisher can be strings or objects. If it is a string, it is likely a reference and be to minimal to become an object in the new API
* Mapping of periodicals is not yet implemented. ALMA has a different way of handling periodicals than UBBONT. ALMA or Marc records does not have issues/volumes as separate entities, at least not in Oria. We should look at PRESSoo and FRBRoo for guidance on how to handle periodicals. Naturen is the prime example of a periodical in Marcus.
* ubbont:reproducedBy has abit unclear meaning. 
* event:producedIn is unclear. It is used for both "depicts" and "influencedBy".