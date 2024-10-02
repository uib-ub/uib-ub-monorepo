import { getLengthUnit } from '@helpers/mappers/getLengthUnit';
import { aatCircaType, aatCountOfType, aatHeightType, aatPagesMeasurementUnitType, aatWidthtType } from '@helpers/mappers/staticMapping';
import omitEmptyEs from 'omit-empty-es';

export const constructDimension = (data: any) => {
  const {
    pages,
    extent,
    height,
    width,
  } = data;

  if (
    !pages &&
    !height &&
    !width &&
    !extent
  ) return data;

  delete data.pages;
  delete data.extent;
  delete data.height;
  delete data.width;

  let pagesArray: any[] = [];
  let heightArray: any[] = []
  let widthArray: any[] = []

  // add dimensions
  if (pages) {
    pagesArray = [{
      type: "Dimension",
      _label: {
        no: [`Antall sider`],
        en: [`Number of pages`],
      },
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
      _label: {
        no: [`Antall sider`],
        en: [`Number of pages`],
      },
      classified_as: [
        aatCountOfType,
      ],
      value: parseInt(extent),
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
    ],
  });
}