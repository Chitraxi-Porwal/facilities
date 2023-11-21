import { api, hasError } from '@/adapter';
import logger from '@/logger';
import { DateTime } from 'luxon';

const fetchFacilities = async(query: any): Promise <any> => {
  return api({
    url: "performFind", 
    method: "post",
    data: query
  });
}

const fetchFacilityGroupInformation = async(facilityIds: Array<string>): Promise<any> => {
  let facilitiesGroupInformation = []
  
  const params = {
    inputFields: {
      facilityId: facilityIds,
      facilityId_op: "in"
    },
    fieldList: ['facilityId', 'facilityGroupId', 'facilityGroupTypeId', "fromDate"],
    entityName: "FacilityGroupAndMember",
    distinct: 'Y',
    filterByDate: 'Y',
    viewSize: facilityIds.length * 10 // multiplying the id by 10, as one facility at max will be in 10 groups
  }

  try {
    const resp = await api({
      url: "performFind", 
      method: "post",
      data: params
    }) as any;

    if(!hasError(resp) && resp.data.count > 0) {
      facilitiesGroupInformation = resp.data.docs.reduce((facilityGroups: any, facilityGroup: any) => {

        if(facilityGroups[facilityGroup.facilityId]) {
          facilityGroups[facilityGroup.facilityId].push({
            ...facilityGroup
          })
        } else {
          facilityGroups[facilityGroup.facilityId] = [{
            ...facilityGroup
          }]
        }

        return facilityGroups
      }, {})
    } else {
      throw resp.data;
    }
  } catch(err) {
    logger.error(err)
  }

  return facilitiesGroupInformation;
}

const fetchFacilitiesOrderCount = async(facilityIds: Array<string>): Promise<any> => {
  let facilitiesOrderCount = {}, resp: any;
  try {
    const params = {
      entityName: "FacilityOrderCount",
      inputFields: {
        facilityId: facilityIds,
        facilityId_op: "in",
        entryDate: DateTime.now().toFormat('yyyy-MM-dd'),
      },
      viewSize: facilityIds.length,
      fieldList: ["entryDate", "facilityId", "lastOrderCount"],
    }

    resp = await api({
      url: "performFind",
      method: "post",
      data: params
    })

    if (!hasError(resp) && resp.data.count > 0) {
      facilitiesOrderCount = resp.data.docs.reduce((facilitiesCount: any, facilityCount: any) => {
        facilitiesCount[facilityCount.facilityId] = facilityCount.lastOrderCount
        return facilitiesCount
      }, {})
    } else {
      throw resp.data
    }
  } catch(err) {
    logger.error("Failed to fetch total orders count", err);
  }

  return facilitiesOrderCount;
}

const fetchFacilityOrderCounts = async(facilityId: string): Promise<any> => {
  let facilityOrderCounts = {}, resp: any;
  try {
    const params = {
      entityName: "FacilityOrderCount",
      inputFields: {
        facilityId: facilityId
      },
      viewSize: 10, // only fetching last 10 order consumed information for facility
      fieldList: ["entryDate", "facilityId", "lastOrderCount"],
      orderBy: "entryDate DESC"
    }

    resp = await api({
      url: "performFind",
      method: "post",
      data: params
    })

    if (!hasError(resp) && resp.data.count > 0) {
      facilityOrderCounts = resp.data.docs.map((facilityOrderCount: any) => {
        facilityOrderCount.entryDate = DateTime.fromMillis(facilityOrderCount.entryDate).toFormat('MMM dd yyyy')
        return facilityOrderCount
      })
    } else {
      throw resp.data
    }
  } catch(err) {
    logger.error("Failed to fetch order consumed history for this facility", err);
  }

  return facilityOrderCounts;
}

const updateFacility = async (payload: any): Promise<any> => {
  return api({
    url: "service/updateFacility",
    method: "post",
    data: payload
  })
}

const fetchFacilityLocations = async(payload: any): Promise<any> => {
  return api({
    url: "performFind",
    method: "post",
    data: payload
  })
}

const addFacilityToGroup = async (payload: any): Promise<any> => {
  return api({
    url: "service/addFacilityToGroup",
    method: "post",
    data: payload
  })
}

const createFacilityLocation = async(payload: any): Promise<any> => {
  return api({
    url: "service/createFacilityLocation",
    method: "post",
    data: payload
  })
}

const updateFacilityLocation = async(payload: any): Promise<any> => {
  return api({
    url: "service/updateFacilityLocation",
    method: "post",
    data: payload
  })
}

const deleteFacilityLocation = async(payload: any): Promise<any> => {
  return api({
    url: "service/deleteFacilityLocation",
    method: "post",
    data: payload
  })
}

const updateFacilityToGroup = async (payload: any): Promise<any> => {
  return api({
    url: "service/updateFacilityToGroup",
    method: "post",
    data: payload
  })
}

export const FacilityService = {
  createFacilityLocation,
  deleteFacilityLocation,
  fetchFacilityLocations,
  addFacilityToGroup,
  fetchFacilityGroupInformation,
  fetchFacilityOrderCounts,
  fetchFacilitiesOrderCount,
  fetchFacilities,
  updateFacility,
  updateFacilityLocation,
  updateFacilityToGroup
}