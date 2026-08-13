let vectors = [];


const saveVector = (data) => {
    vectors.push(data);
};


const getVectors = () => {
    return vectors;
};


module.exports = {
    saveVector,
    getVectors
};
