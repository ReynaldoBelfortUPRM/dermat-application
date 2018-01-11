# import Upload_Individual_Images 
# import makesqr
import RCM_LayerSeparation
import UploadImagesMatrix

# import RCM_Classification_v2

# import RCM_LayerSeparation_NC
# import CharacterizeImages

import time
import sys
import json
import numpy as np
import scipy.io
from pprint import pprint
from PIL import Image

# import matplotlib.pyplot as plt
# import matplotlib.cm as cm
import matplotlib.image as img

# Prints arguments sent to python script (not used)
# print "\n".join(sys.argv)

# #Read data from stdin
# def read_in():
#     lines = sys.stdin.readlines()
# #     # Since our input would only be having one line, parse our JSON data from that
#     return json.loads(lines[0])

# def main():
#     # Start timing
#     t0 = time.time()

#  # -----------------------------Input management-----------------------------

# # get our data as an array from read_in()
#     ipmInput = read_in()
#     # print ipmInput
# # print ipmInput in json format 
# # (TEST INPUT)
#     # pprint(ipmInput)

# # Print specific attribute from the json object
#     # print ipmInput['LayersInfo'][0]['LayerID']
#     # print ipmInput['filePaths'][0]

#     # file = open('C:\\Users\\Beto\\Desktop\\Capstone\\DermAT\\RCM_Images\\Fair8_RCMpng_Train\\Fair8_1_RCM.png','r')
#     file = open(ipmInput['originalImages'][0])
#     # print file
    
#     # image = np.array(file)

# # Open image to extract properties
#     image = Image.open(ipmInput['originalImages'][0])
#     # image.show()

# # Extracts size tuple of the image
#     size = image.size
#     # print image.size

# # Extracts amount of elements in the JSON array
#     elementCount = len(ipmInput['originalImages'])
#     # print elementCount

# # Preallocate space for the data
#     data = np.empty((size[1],size[0],elementCount),dtype=np.uint8)
#     # data = np.zeros((2,2),dtype=np.uint8)
#     # pprint(data)
#     # print data[0][0][0]
#     # print size[0] #columns
#     # print size[1] #rows
      
# # Add pixel data into zero array
#     for i in range(0, elementCount):
#         image = img.imread(ipmInput['originalImages'][i])
#         image = image*255
#         # data[:][:][i] = image[:][:]
#         # print image[0][0]
#         # print data[0][0][0]

#         # Copies image pixels into data array
#         for j in range(0, size[1]):
#             for k in range(0, size[0]):
#                 data[j][k][i] = image[j][k]


#         # print 'Step: ' + repr(i+1) + ' of ' + repr(elementCount)
#         # sys.stdout.flush()
#         # Used to verify correct data input in array
#         # print data[0][0][i]
#         # print data[0][954-1][i]
#         # print data[840-1][0][i]
#         # print data[840-1][954-1][i]

#         # print data.shape
#         # print image.shape

#     # Required files path
#     reqPath = "C:\Users\Beto\electron-quick-start"
#     # Saves image matrix in .mat file to be accessed by the runtime
#     scipy.io.savemat(reqPath + '\ImageArray.mat', {'imagePaths': data})
    
#     # Finish timing
#     # t1 = time.time()
#     # total = t1 - t0 
#     # print('Total time: ' + repr(total) + ' seconds')

#     # data[:][:] = test[:][:]
#     # print data[:][:]


#     # plt.imsave(ipmInput['filePaths'][0], np.array(result).reshape(954,840), cmap=cm.gray)
#     # plt.imshow(np.array(result).reshape(954,840))
#     # fig
#     # imshow(file)
#       # for item in ipmInput:
#         # print ipmInput 

#     # Prints layerInfo attributes
#     # print ipmInput["LayersInfo"]

    # ----------------------------Runtime management-----------------------------
    ###############################################################
message = {
    "messageType": "status",
    "data": "Step 1: Uploading images....."
}
print json.dumps(message)
sys.stdout.flush()

    # # Initializes MATLAB runtime
    # matlabRuntime1 = UploadImagesMatrix.initialize()
    
    # # Input: Path to folder where the stack of original images is stored
    # # Output: Matrix containing pixel values of all the images in the stack
    # data_mat = matlabRuntime1.UploadImagesMatrix("C:\\Users\\Beto\\Desktop\\Capstone\\DermAT\\RCM_Images\\Fair8_RCMpng_Train\\")
    # # print (data[0][0])            # Test correct data input
    # print 'Images succesfully uploaded'
    
    # # matlabRuntime.RCM_LayerSeparation(data,"C:\Users\Beto\electron-quick-start","C:\Users\Beto\Desktop\Capstone\DermAT\RCM_Images\Characterized_Images")
        
    # # Terminates MATLAB runtime
    # matlabRuntime1.terminate()

    # print type(data_mat)
    # sys.stdout.flush()

    # t1 = time.time()
    # total = t1 - t0 
    # print('Total time: ' + repr(total) + ' seconds')
    # t0 = t1
    ###############################################################
message["data"] = "Step 2: Classifying images....."
print json.dumps(message)
sys.stdout.flush()

    # Initializes MATLAB runtime
    # matlabRuntime2 = RCM_LayerSeparation.initialize()

    # Input: Matrix of pixel values,
    #        Path to folder where texton library and models are stored,
    #        Path to folder where characterized images will be stored
    # Output: Vector containing the classification of each image in the stack
    # layerClassification = matlabRuntime2.RCM_LayerSeparation(data1,reqPath,"C:\Users\Beto\Desktop\Capstone\DermAT\RCM_Images\Characterized_Images")
    # print (layerClassification)   #Test classifier output
    # print(classifiedMatrix[0][0])
    # print 'Images classified'

    # Terminate MATLAB runtime
    # matlabRuntime2.terminate()
    
    # t1 = time.time()
    # total = t1 - t0 
    # print('Total time: ' + repr(total) + ' seconds')
    # t0 = t1
    ###############################################################
    # print 'Saving classified images'
    # # matlabRuntime3 = CharacterizeImages.initialize()
    # matlabRuntime.CharacterizeImages(layerClassification[1],"C:\Users\Beto\Desktop\Capstone\DermAT\RCM_Images\Characterized_Images")
    # print 'Images saved'
    # sys.stdout.flush()
    # matlabRuntime.terminate()

    # t1 = time.time()
    # total = t1 - t0 
    # print('Total time: ' + repr(total) + ' seconds')

    # ----------------------------Output management-----------------------------
ipmOutput = {
    "characterizedImages": [
        "/Temp/Image1",
        "/Temp/Image2",
        "/Temp/Image3",
        "/Temp/Image4",
        "/Temp/Image5",
        "/Temp/Image6",
        "/Temp/Image7",
        "/Temp/Image8",
        "/Temp/Image9"      
    ],

    "LayersInfo": [
        {
            "LayerID":1,
            "LayerName":"Stratum Corneum",
            "LayerThickness":10,
            "LayerRange":[1,10]
        },
        {
            "LayerID":2,
            "LayerName":"Stratum Granulosum",
            "LayerThickness":6,
            "LayerRange":[11,16]
        },
        {
            "LayerID":3,
            "LayerName":"Stratum Spinosum",
            "LayerThickness":"5",
            "LayerRange":[17,21]
        },
        {
            "LayerID":4,
            "LayerName":"Stratum Basale",
            "LayerThickness":8,
            "LayerRange":[22,29]
        },
        {
            "LayerID":5,
            "LayerName":"Papillary Dermis",
            "LayerThickness":7,
            "LayerRange":[30,36]
        },

    ]
}
# Returns the JSON output to Electron in a single string
# (TEST OUTPUT)
message["messageType"] = "results"
message["data"] = ipmOutput
print json.dumps(message)
# print message
sys.stdout.flush()
  
   
    # Write JSON string to file
    # with open("ipmOutput.json","w") as outfile:
    #     json.dump(layerClassification, outfile, indent = 3)
    # # pprint(ipmOutput)

# Start process
# if __name__ == '__main__':
# main()
