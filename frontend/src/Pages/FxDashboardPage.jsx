import { Box, VStack, HStack } from '@chakra-ui/react'
import FxPrediction from '../components/Forex/FxPrediction'
import FxPredictionResult from '../components/Forex/FxPredictionResult'
import RealFxData from '../components/Forex/RealFxData'


const FxDashboardPage = () => {
  return (
    <Box>
      <VStack>
        <Box>
          <FxPrediction/>
        </Box>
        {/* <HStack gap={"20px"}>
          <Box border={"1px solid"}>
            <RealFxData/>
          </Box>
          <Box border={"1px solid"}>
            <FxPredictionResult/>
          </Box>
        </HStack> */}
      </VStack>
    </Box>
  )
}

export default FxDashboardPage