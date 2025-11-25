import { getLengthUnit } from '../getLengthUnit';
import { aatCircaType, aatCountOfType, aatHeightType, aatPagesMeasurementUnitType, aatWidthtType } from '../staticMapping';
import omitEmptyEs from 'omit-empty-es';

export const constructDimension = (data: any) => {
  const {
    pages,
    extent,
    height,
    width,
    pageStart,
    pageEnd
  } = data;

  if (
    !pages &&
    !height &&
    !width &&
    !extent &&
    !pageStart &&
    !pageEnd
  ) return data;

  delete data.pages;
  delete data.extent;
  delete data.height;
  delete data.width;
  delete data.pageStart;
  delete data.pageEnd;

  let pagesArray: any[] = [];
  let heightArray: any[] = []
  let widthArray: any[] = []
  let calculatedPaginationArray: any[] = []

  // add dimensions
  if (pages) {
    pagesArray = [{
      type: "Dimension",
      _label: `Antall sider`,
      classified_as: [
        aatCountOfType,
      ],
      value: parseInt(pages),
      unit: aatPagesMeasurementUnitType,
    }]
  }

  if (Number.isInteger(extent)) {
    pagesArray = [{
      type: "Dimension",
      _label: `Antall sider`,
      classified_as: [
        aatCountOfType,
      ],
      value: parseInt(extent),
      unit: aatPagesMeasurementUnitType,
    }]
  }


  if (pageStart && pageEnd) {
    calculatedPaginationArray = [{
      type: "Dimension",
      _label: `Antall sider`,
      classified_as: [
        aatCountOfType,
      ],
      value: parseInt(pageEnd) - parseInt(pageStart) + 1,
      unit: aatPagesMeasurementUnitType,
    }]
  }

  if (height) {
    const { value, unit, isApproximation } = getLengthUnit(height)
    heightArray = [{
      type: "Dimension",
      classified_as: [
        aatHeightType,
        isApproximation ? aatCircaType : undefined
      ],
      value,
      unit,
    }]
  }

  if (width) {
    const { value, unit, isApproximation } = getLengthUnit(width)
    widthArray = [{
      type: "Dimension",
      classified_as: [
        aatWidthtType,
        isApproximation ? aatCircaType : undefined
      ],
      value,
      unit
    }]
  }

  return omitEmptyEs({
    ...data,
    dimension: [
      ...heightArray,
      ...widthArray,
      ...pagesArray,
      ...calculatedPaginationArray,
    ],
  });
}