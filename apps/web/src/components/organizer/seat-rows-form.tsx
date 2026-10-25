"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { getErrorMessage } from "@/lib/api/client";
import { createEventSeats } from "@/lib/api/events";
import { useToast } from "@/lib/toast/toast-provider";
import {
  seatRowsSchema,
  type SeatRowsValues,
} from "@/lib/validation/event";
import { formatNumber } from "@/lib/utils/format";

interface SeatRowsFormProps {
  eventId: string;
  existingRows: string[];
  onAdded: () => void;
}

function nextRowLabel(usedValues: string[]): string {
  const used = new Set(
    usedValues.map((value) => value.trim().toUpperCase()).filter(Boolean),
  );

  for (let code = 65; code <= 90; code += 1) {
    const label = String.fromCharCode(code);

    if (!used.has(label)) {
      return label;
    }
  }

  for (let index = 1; index < 100; index += 1) {
    const label = `R${index}`;

    if (!used.has(label)) {
      return label;
    }
  }

  return "ROW";
}

function buildRow(usedValues: string[]) {
  return {
    row: nextRowLabel(usedValues),
    seatCount: 10,
    price: 25,
  };
}

export function SeatRowsForm({
  eventId,
  existingRows,
  onAdded,
}: SeatRowsFormProps) {
  const { toast } = useToast();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SeatRowsValues>({
    resolver: zodResolver(seatRowsSchema),
    defaultValues: {
      rows: [buildRow(existingRows)],
    },
    mode: "onTouched",
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "rows",
  });
  const watchedRows = useWatch({ control, name: "rows" });
  const totalSeats = watchedRows.reduce(
    (total, row) => total + (Number(row.seatCount) || 0),
    0,
  );

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);

    const existingSet = new Set(
      existingRows.map((row) => row.trim().toUpperCase()),
    );
    const duplicate = values.rows.find((row) =>
      existingSet.has(row.row.trim().toUpperCase()),
    );

    if (duplicate) {
      setFormError(
        `Row ${duplicate.row.trim().toUpperCase()} already has seats. Choose a different row label.`,
      );
      return;
    }

    try {
      await createEventSeats(eventId, {
        rows: values.rows.map((row) => ({
          row: row.row.trim().toUpperCase(),
          seatCount: row.seatCount,
          price: row.price,
        })),
      });

      const usedRows = [
        ...existingRows,
        ...values.rows.map((row) => row.row.trim().toUpperCase()),
      ];

      reset({ rows: [buildRow(usedRows)] });
      toast({
        title: "Seats added",
        description: `${formatNumber(
          values.rows.reduce((total, row) => total + row.seatCount, 0),
        )} seats added to this event.`,
        variant: "success",
      });
      onAdded();
    } catch (error) {
      setFormError(getErrorMessage(error));
    }
  });

  const handleAddRow = () => {
    const usedValues = [
      ...existingRows,
      ...watchedRows.map((row) => row.row),
    ];

    append(buildRow(usedValues));
  };

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      {formError ? (
        <Alert variant="error" title="Couldn't add these seats">
          {formError}
        </Alert>
      ) : null}

      <div className="space-y-3">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="rounded-lg border border-line bg-surface-subtle p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-ink">Row {index + 1}</p>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => remove(index)}
                disabled={fields.length === 1 || isSubmitting}
                aria-label={`Remove row ${index + 1}`}
              >
                <Trash2 className="size-4" aria-hidden />
              </Button>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <FormField
                id={`seat-row-${field.id}`}
                label="Row label"
                error={errors.rows?.[index]?.row?.message}
                required
              >
                {(fieldProps) => (
                  <Input
                    {...fieldProps}
                    placeholder="A"
                    maxLength={10}
                    {...register(`rows.${index}.row`)}
                  />
                )}
              </FormField>
              <FormField
                id={`seat-count-${field.id}`}
                label="Seats"
                error={errors.rows?.[index]?.seatCount?.message}
                required
              >
                {(fieldProps) => (
                  <Input
                    {...fieldProps}
                    type="number"
                    min={1}
                    max={500}
                    step={1}
                    {...register(`rows.${index}.seatCount`, {
                      valueAsNumber: true,
                    })}
                  />
                )}
              </FormField>
              <FormField
                id={`seat-price-${field.id}`}
                label="Price per seat"
                error={errors.rows?.[index]?.price?.message}
                required
              >
                {(fieldProps) => (
                  <Input
                    {...fieldProps}
                    type="number"
                    min={0}
                    step="0.01"
                    {...register(`rows.${index}.price`, {
                      valueAsNumber: true,
                    })}
                  />
                )}
              </FormField>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddRow}
          disabled={isSubmitting}
        >
          <Plus className="size-4" aria-hidden />
          Add another row
        </Button>
        <p className="text-xs text-ink-subtle">
          {formatNumber(totalSeats)} seats in this batch
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
        <p className="text-xs leading-5 text-ink-subtle">
          Row labels are uppercase and seats are numbered from 1.
        </p>
        <Button type="submit" isLoading={isSubmitting}>
          Add seats
        </Button>
      </div>
    </form>
  );
}
