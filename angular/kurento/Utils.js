function jq( myid ) {
    return "#" + myid.replace( /(@|:|\.|\[|\]|,)/g, "\\$1" );
}
