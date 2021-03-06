import LayerSeparation
import urllib
import os
import time
import sys
import json
import numpy as np
import scipy.io
import matplotlib.image as img
from pprint import pprint
from PIL import Image
from multiprocessing.pool import ThreadPool

matlabRuntime = None

# Read data from stdin
def read_in():
    lines = sys.stdin.readlines()
    # Since our input would only be having one line, parse our JSON data from that
    return json.loads(lines[0])

def check_cancel():
    try:
        local_filename, headers = urllib.urlretrieve('http://localhost:8080/')
        # print "Success retrieve"
        # sys.stdout.flush()
        html = open(local_filename)    
        endMessage = html.read()
        html.close()
        if endMessage == 'end':
            try:
                matlabRuntime.terminate()  
                # print "Success terminate"
                # sys.stdout.flush()          
            except AttributeError:
                # print "Fail terminate"
                # sys.stdout.flush()
                exit()
                return None
    except IOError:
        # print "Fail retrieve"
        # sys.stdout.flush()
        return None
        
        
def runMatlabRuntime(arrayPath,savePath):
    message = {
        "messageType": "status",
        "data": "Step 2: Classifying images..."
    }
    print json.dumps(message)
    sys.stdout.flush()

    # Initializes MATLAB runtime
    matlabRuntime = LayerSeparation.initialize()

    classified = matlabRuntime.LayerSeparation(arrayPath,savePath)

    message["data"] = "Step 3: Validating results..."
    print json.dumps(message)
    sys.stdout.flush()

    ipmOutputMatlab = matlabRuntime.ValidationCharacterize(classified,savePath)

    matlabRuntime.terminate()

    return ipmOutputMatlab


def main():
    # Start timing
    t0 = time.time()

    # Input: Filepath array original images is
    # Output: Matrix containing pixel values of all the images in the stack
    message = {
        "messageType": "status",
        "data": "Step 1: Preparing images..."
    }
    print json.dumps(message)
    sys.stdout.flush()

# Get our data as an array from read_in()
    ipmInput = read_in()

# Open image to extract properties
    image = Image.open(ipmInput['originalImages'][0])
    # image.show()

# Extracts size tuple of the image
    size = image.size
    # print image.size

# Extracts amount of elements in the JSON array
    elementCount = len(ipmInput['originalImages'])
    # print elementCount

# Preallocate space for the data
    data = np.empty((size[1],size[0],elementCount),dtype=np.uint8)
      
# Add pixel data into zero array
    for i in range(0, elementCount):
        image = img.imread(ipmInput['originalImages'][i])
        image = image*255

        # Copies image pixels into data array
        for j in range(0, size[1]):
            for k in range(0, size[0]):
                data[j][k][i] = image[j][k]

    
    # Path where to output images
    outputImagesSavePath = ipmInput['appDataPath'] + '\characterized-images'
    # Path to access stored and load image matrix
    ImageArrayPath = ipmInput['appDataPath']

    # If output folder does not exist, create it
    if not os.path.exists(outputImagesSavePath):
        os.makedirs(outputImagesSavePath)

    # Saves image matrix in .mat file to be accessed by the runtime
    scipy.io.savemat(ImageArrayPath + '\ImageArray.mat', {'imageData': data})
    
    # ----------------------------Runtime management-----------------------------
    

    pool = ThreadPool(processes=1)
    async_result = pool.apply_async(runMatlabRuntime, (ImageArrayPath, outputImagesSavePath)) # tuple of args for foo

    # notDone = True
    # while notDone == True:
    #     time.sleep(0.25)
    #     try:
    #         ipmOutput =  async_result.get()
    #         notDone = False
    #     except NameError:
    #         check_cancel()
    
    ipmOutput =  async_result.get()

    thickness1 = ipmOutput[0][2] - ipmOutput[0][1] + 1
    thickness2 = ipmOutput[1][2] - ipmOutput[1][1] + 1
    thickness3 = ipmOutput[2][2] - ipmOutput[2][1] + 1
    thickness4 = ipmOutput[3][2] - ipmOutput[3][1] + 1
    thickness5 = ipmOutput[4][2] - ipmOutput[4][1] + 1 
    # ----------------------------Output management-----------------------------
    ipmOutputJSON = {
    
        "LayersInfo": [
            {
                "LayerID":1,
                "LayerName":"Stratum Corneum",
                "LayerThickness":thickness1,
                "LayerRange":[ipmOutput[0][1],ipmOutput[0][2]]
            },
            {
                "LayerID":2,
                "LayerName":"Stratum Granulosum",
                "LayerThickness":thickness2,
                "LayerRange":[ipmOutput[1][1],ipmOutput[1][2]]
            },
            {
                "LayerID":3,
                "LayerName":"Stratum Spinosum",
                "LayerThickness":thickness3,
                "LayerRange":[ipmOutput[2][1],ipmOutput[2][2]]
            },
            {
                "LayerID":4,
                "LayerName":"Stratum Basale",
                "LayerThickness":thickness4,
                "LayerRange":[ipmOutput[3][1],ipmOutput[3][2]]
            },
            {
                "LayerID":5,
                "LayerName":"Dermis",
                "LayerThickness":thickness5,
                "LayerRange":[ipmOutput[4][1],ipmOutput[4][2]]
            },

        ]
    }

    if ipmOutput[0][0]+ipmOutput[1][0]+ipmOutput[2][0]+ipmOutput[3][0]+ipmOutput[4][0] == 0:
        message["messageType"] = "error"
        message["data"] = ipmOutputJSON
        print json.dumps(message)
        sys.stdout.flush()

# Returns the JSON output to Electron in a single string
# (TEST OUTPUT)
    else:
        message["messageType"] = "results"
        message["data"] = ipmOutputJSON
        print json.dumps(message)
        sys.stdout.flush()
  

# Start process
main()
